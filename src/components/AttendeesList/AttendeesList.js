import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import InfiniteScroll from 'react-infinite-scroll-component'
import style from './style.module.scss'

let accessRepo = null
let chatRepo = null
const url = window.location.href
let urlAccessesPageIx = 0
let showAccessesPageIx = 0
const pageSize = 6

export const scopes = {
  PAGE: 'page',
  SHOW: 'show'
}

const AttendeesList = (props) => {
  const { supabaseUrl, supabaseKey, scope, summitId } = props
  const [hasMore, setHasMore] = useState(true)
  const [attendeesList, setAttendeesList] = useState([])

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }
  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey)
  }
  const { attendeesNews, chatNotificationsMap } = useStore({
    url,
    summitId,
    accessRepository: accessRepo,
    chatRepository: chatRepo
  })

  // handle real-time updates
  useEffect(() => {
    if (scope === scopes.PAGE) {
      if (attendeesList.length === 0) {
        accessRepo
          .fetchCurrentPageAttendees(url, urlAccessesPageIx, pageSize)
          .then((response) => {
            if (response) {
              setAttendeesList(
                chatRepo.mergeChatNews(response, chatNotificationsMap)
              )
            }
          })
          .catch(console.error)
      } else if (attendeesNews && Object.keys(attendeesNews).length > 0) {
        // merge news
        accessRepo
          .mergeChanges(attendeesList, attendeesNews, url)
          .then((response) => {
            if (response) {
              setAttendeesList(
                chatRepo.mergeChatNews(response, chatNotificationsMap)
              )
            }
          })
          .catch(console.error)
      }
    } else {
      if (attendeesList.length === 0) {
        showAccessesPageIx = 0
        accessRepo
          .fetchCurrentShowAttendees(summitId, showAccessesPageIx, pageSize)
          .then((response) => {
            if (response) {
              setAttendeesList(
                chatRepo.mergeChatNews(response, chatNotificationsMap)
              )
            }
          })
          .catch(console.error)
      } else if (attendeesNews && Object.keys(attendeesNews).length > 0) {
        // merge news
        accessRepo
          .mergeChanges(attendeesList, attendeesNews)
          .then((response) => {
            if (response) {
              setAttendeesList(
                chatRepo.mergeChatNews(response, chatNotificationsMap)
              )
            }
          })
          .catch(console.error)
      }
    }
  }, [attendeesNews, chatNotificationsMap])

  const fetchMoreData = async () => {
    let nextPage
    if (scope === scopes.PAGE) {
      nextPage = await accessRepo.fetchCurrentPageAttendees(
        url,
        ++urlAccessesPageIx,
        pageSize
      )
    } else {
      nextPage = await accessRepo.fetchCurrentShowAttendees(
        summitId,
        ++showAccessesPageIx,
        pageSize
      )
    }

    if (nextPage.length === 0) {
      setHasMore(false)
      return
    }
    setAttendeesList([...attendeesList, ...nextPage])
  }

  let handleSearchDebounce
  const handleSearch = (e) => {
    const { value } = e.target
    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      // console.log('value', value)
      if (scope === scopes.PAGE) {
        urlAccessesPageIx = 0
        const res = value
          ? await accessRepo.findByFullName(value, summitId, url)
          : await accessRepo.fetchCurrentPageAttendees(
              url,
              urlAccessesPageIx,
              pageSize
            )
        if (res && res.length > 0) setAttendeesList([...res])
      } else {
        showAccessesPageIx = 0
        const res = value
          ? await accessRepo.findByFullName(value, summitId, '')
          : await accessRepo.fetchCurrentShowAttendees(
              summitId,
              showAccessesPageIx,
              pageSize
            )
        if (res && res.length > 0) setAttendeesList([...res])
      }
    }, 150)
    handleSearchDebounce()
  }

  if (attendeesList) {
    if (attendeesList.length > 0) {
      return (
        <div className={style.outerWrapper}>
          <div className={style.searchWrapper}>
            <input
              type='search'
              className={style.searchInput}
              onChange={handleSearch}
              placeholder='Filter attendees'
            />
          </div>
          <InfiniteScroll
            dataLength={attendeesList.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            height={300}
          >
            {attendeesList.map((item) => (
              <AttendeesListItem
                key={`item-${item.id}`}
                item={item}
                {...props}
              />
            ))}
          </InfiniteScroll>
        </div>
      )
    }
    return <div>No info</div>
  }
  return <div>Loading...</div>
}

AttendeesList.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired,
  scope: PropTypes.oneOf([scopes.PAGE, scopes.SHOW])
}

export default AttendeesList
