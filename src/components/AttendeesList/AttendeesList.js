import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import { SearchBar } from '../SearchBar/SearchBar'
import InfiniteScroll from 'react-infinite-scroll-component'
import style from './style.module.scss'

let urlAccessesPageIx = 0
let showAccessesPageIx = 0
const pageSize = 6
let firstNewsUpdate = true

export const scopes = {
  PAGE: 'page',
  SHOW: 'show'
}

const AttendeesList = (props) => {
  const { accessRepo, chatRepo, summitId, url } = props
  const [hasMore, setHasMore] = useState(true)
  const [currScope, setCurrScope] = useState(scopes.SHOW)
  const [attendeesList, setAttendeesList] = useState([])

  const { attendeesNews } = useStore({
    url,
    summitId,
    accessRepository: accessRepo,
    chatRepository: chatRepo
  })

  const updateAttendeesList = (promise) => {
    promise
      .then((response) => {
        if (response && response.length > 0) {
          setAttendeesList(response)
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

    if (currScope === scopes.PAGE) {
      if (attendeesList.length === 0) {
        updateAttendeesList(
          accessRepo.fetchCurrentPageAttendees(url, urlAccessesPageIx, pageSize)
        )
      } else if (attendeesNews && Object.keys(attendeesNews).length > 0) {
        // merge news
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
    if (currScope === scopes.PAGE) {
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
      if (currScope === scopes.PAGE) {
        urlAccessesPageIx = 0
        const res = value
          ? await accessRepo.findByAttendeeFullName(value, summitId, url)
          : await accessRepo.fetchCurrentPageAttendees(
              url,
              urlAccessesPageIx,
              pageSize
            )
        if (res && res.length > 0) {
          setAttendeesList([...res])
        }
      } else {
        showAccessesPageIx = 0
        const res = value
          ? await accessRepo.findByAttendeeFullName(value, summitId, '')
          : await accessRepo.fetchCurrentShowAttendees(
              summitId,
              showAccessesPageIx,
              pageSize
            )
        if (res && res.length > 0) {
          setAttendeesList([...res])
        }
      }
    }, 150)
    handleSearchDebounce()
  }

  const handleFilterModeChange = (mode) => {
    setCurrScope(mode === 0 ? scopes.SHOW : scopes.PAGE)
  }

  if (attendeesList) {
    return (
      <div className={style.outerWrapper}>
        <SearchBar
          onSearch={handleSearch}
          onFilterModeChange={handleFilterModeChange}
          filterMenuOptions={['All Attendees', 'On this Room']}
        />
        <InfiniteScroll
          dataLength={attendeesList.length}
          next={fetchMoreData}
          hasMore={hasMore}
          // loader={<h4>Loading...</h4>}
          height={props.height}
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
  supabaseKey: PropTypes.string.isRequired
}

export default AttendeesList
