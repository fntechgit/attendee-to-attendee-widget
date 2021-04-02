import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import InfiniteScroll from 'react-infinite-scroll-component'
import style from './style.module.scss'

let urlAccessesPageIx = 0
let showAccessesPageIx = 0
const pageSize = 6
let firstNewsUpdate = true
let chatNotificationsMapAux = {}

export const scopes = {
  PAGE: 'page',
  SHOW: 'show'
}

const AttendeesList = (props) => {
  const { accessRepo, chatRepo, scope, summitId, url } = props
  const [hasMore, setHasMore] = useState(true)
  const [attendeesList, setAttendeesList] = useState([])

  const { attendeesNews, chatNotificationsMap } = useStore({
    url,
    summitId,
    accessRepository: accessRepo,
    chatRepository: chatRepo
  })

  const updateAttendeesList = (promise) => {
    promise
      .then((response) => {
        console.log('updateAttendeesList chatNotificationsMap...', response.length, Object.keys(chatNotificationsMapAux).length)
        if (response && response.length > 0) {
          setAttendeesList(
            chatRepo.mergeChatNews(response, chatNotificationsMapAux)
          )
        }
      })
      .catch(console.error)
  }

  // handle real-time updates
  useEffect(() => {
    if (firstNewsUpdate) {
      firstNewsUpdate = false
      return
    }

    if (Object.keys(chatNotificationsMap).length > 0) {
      chatNotificationsMapAux = {...chatNotificationsMap}
    }

    if (scope === scopes.PAGE) {
      console.log('Loading page attendees...')
      if (attendeesList.length === 0) {                                             
        console.log('Fetching...')
        updateAttendeesList(
          accessRepo.fetchCurrentPageAttendees(url, urlAccessesPageIx, pageSize)
        )
      } else if (attendeesNews && Object.keys(attendeesNews).length > 0) {
        // merge news
        console.log('Merging...')
        updateAttendeesList(
          accessRepo.mergeChanges(attendeesList, attendeesNews, url)
        )
      }
    } else {
      if (attendeesList.length === 0) {
        updateAttendeesList(
          accessRepo.fetchCurrentShowAttendees(
            summitId,
            showAccessesPageIx,
            pageSize
          )
        )
      } else if (attendeesNews && Object.keys(attendeesNews).length > 0) {
        // merge news
        updateAttendeesList(
          accessRepo.mergeChanges(attendeesList, attendeesNews)
        )
      }
    }
  }, [attendeesNews])

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
    setAttendeesList(
      chatRepo.mergeChatNews(
        [...attendeesList, ...nextPage],
        chatNotificationsMap
      )
    )
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
        if (res && res.length > 0) {
          setAttendeesList(
            chatRepo.mergeChatNews([...res], chatNotificationsMap)
          )
        }
      } else {
        showAccessesPageIx = 0
        const res = value
          ? await accessRepo.findByFullName(value, summitId, '')
          : await accessRepo.fetchCurrentShowAttendees(
              summitId,
              showAccessesPageIx,
              pageSize
            )
        if (res && res.length > 0) {
          setAttendeesList(
            chatRepo.mergeChatNews([...res], chatNotificationsMap)
          )
        }
      }
    }, 150)
    handleSearchDebounce()
  }

  if (attendeesList) {
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
          // loader={<h4>Loading...</h4>}
          height={350}
        >
          {attendeesList.length > 0 &&
            attendeesList.map((item) => (
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
  return <h4>Loading...</h4>
}

AttendeesList.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired,
  scope: PropTypes.oneOf([scopes.PAGE, scopes.SHOW])
}

export default AttendeesList
