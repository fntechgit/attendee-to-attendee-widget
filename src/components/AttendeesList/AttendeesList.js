import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import AccessRepository from '../../lib/AccessRepository'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import InfiniteScroll from 'react-infinite-scroll-component'
import style from './style.module.scss'

let accessRepo = null
let pageIx = 0
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
  const { attendeesNews } = useStore({
    url: window.location.href,
    accessRepository: accessRepo
  })

  //handle real-time updates
  useEffect(() => {
    if (scope === scopes.PAGE && attendeesNews) {
      if (attendeesList.length == 0) {
        accessRepo
          .fetchCurrentPageAttendees(window.location.href, pageIx, pageSize)
          .then((response) => {
            setAttendeesList(response)
          })
          .catch(console.error)
      } else {
        //merge news
        accessRepo
          .mergeChanges(attendeesList, attendeesNews, window.location.href)
          .then((response) => {
            if (response) setAttendeesList(response)
          })
          .catch(console.error)
      }
    } else if (scope === scopes.SHOW && attendeesList.length == 0) {
      accessRepo
        .fetchCurrentShowAttendees(summitId, pageIx, pageSize)
        .then((response) => {
          setAttendeesList(response)
        })
        .catch(console.error)
    }
  }, [attendeesNews])

  const fetchMoreData = async () => {
    let nextPage
    if (scope === scopes.PAGE) {
      nextPage = await accessRepo.fetchCurrentPageAttendees(
        window.location.href,
        ++pageIx,
        pageSize
      )
    } else {
      nextPage = await accessRepo.fetchCurrentShowAttendees(
        summitId,
        ++pageIx,
        pageSize)
    }

    if (nextPage.length == 0) {
      setHasMore(false)
      return
    }
    setAttendeesList([...attendeesList, ...nextPage])
  }

  const handleSearch = (e) => {
    const { value } = e.target
    console.log('handleSearch', value)
  }

  if (attendeesList) {
    if (attendeesList.length > 0) {
      return (
        <div className={style.outerWrapper}>
          <div className={style.searchWrapper}>
            <input
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
