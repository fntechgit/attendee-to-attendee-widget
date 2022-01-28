import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import {
  useAttendeesNews,
  useUpdateAttendeesNews
} from '../../lib/attendeesContext'
import { ATTENDEES_LIST_PAGE_SIZE } from '../../lib/constants'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import { SearchBar } from '../SearchBar/SearchBar'
import InfiniteScroll from 'react-infinite-scroll-component'

import style from './style.module.scss'

let urlAccessesPageIx = 0
let showAccessesPageIx = 0

export const scopes = {
  PAGE: 'page',
  SHOW: 'show'
}

const AttendeesList = (props) => {
  const {
    user,
    accessRepo,
    url,
    onHelpClick,
    onQAClick,
    showHelpButton,
    showQAButton
  } = props
  const [hasMore, setHasMore] = useState(true)
  const [currScope, setCurrScope] = useState(scopes.SHOW)
  const [filteredAttendeesList, setFilteredAttendeesList] = useState(null)

  const attendeesList = useAttendeesNews()
  const setAttendeesList = useUpdateAttendeesNews()

  const updateAttendeesList = (promise) => {
    promise
      .then((response) => {
        if (response && response.length > 0) {
          setAttendeesList(accessRepo.sortByAttName(response))
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    if (attendeesList.length === 0) {
      if (currScope === scopes.PAGE) {
        updateAttendeesList(
          accessRepo.fetchCurrentPageAttendees(url, urlAccessesPageIx, ATTENDEES_LIST_PAGE_SIZE)
        )
      } else {
        updateAttendeesList(
          accessRepo.fetchCurrentShowAttendees(showAccessesPageIx, ATTENDEES_LIST_PAGE_SIZE)
        )
      }
    }
    return () => {
      urlAccessesPageIx = 0
      showAccessesPageIx = 0
    }
  }, [])

  const fetchMoreData = async () => {
    let nextPage
    if (currScope === scopes.PAGE) {
      nextPage = await accessRepo.fetchCurrentPageAttendees(
        url,
        ++urlAccessesPageIx,
        ATTENDEES_LIST_PAGE_SIZE
      )
    } else {
      nextPage = await accessRepo.fetchCurrentShowAttendees(
        ++showAccessesPageIx,
        ATTENDEES_LIST_PAGE_SIZE
      )
    }

    if (nextPage.length === 0) {
      setHasMore(false)
      return
    }
    setAttendeesList(accessRepo.sortByAttName([...attendeesList, ...nextPage]))
  }

  let handleSearchDebounce
  const handleSearch = (value, scope) => {
    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      if (scope === scopes.PAGE) urlAccessesPageIx = 0
      else showAccessesPageIx = 0

      if (value) {
        // const res = await accessRepo.findByNameOrCompany(
        //    value,
        //    scope === scopes.PAGE ? url : ''
        // )
        const res = accessRepo.findByNameOrCompanyLocally(
          attendeesList,
          value,
          scope === scopes.PAGE ? url : ''
        )

        setFilteredAttendeesList(
          res && res.length > 0 ? accessRepo.sortByAttName([...res]) : []
        )
      } else {
        setFilteredAttendeesList(null)
      }
    }, 300)
    handleSearchDebounce()
  }

  const handleFilterModeChange = (mode) => {
    const scope = mode === 0 ? scopes.SHOW : scopes.PAGE
    setCurrScope(scope)
    //handleSearch(null, scope)
    if (scope === scopes.PAGE) {
      urlAccessesPageIx = 0
      setFilteredAttendeesList(
        attendeesList.filter((a) => a.current_url === url)
      )
    } else {
      showAccessesPageIx = 0
      setFilteredAttendeesList(attendeesList)
    }
  }

  const attList = filteredAttendeesList ? filteredAttendeesList : attendeesList

  if (attList) {
    return (
      <div className={style.outerWrapper}>
        <SearchBar
          onSearch={(e) => handleSearch(e.target.value, currScope)}
          onFilterModeChange={handleFilterModeChange}
          filterMenuOptions={['All Attendees', 'In this Room']}
        />
        <InfiniteScroll
          dataLength={attList.length}
          next={fetchMoreData}
          hasMore={hasMore}
          // loader={<h4>Loading...</h4>}
          height={props.height}
        >
          {attList.length > 0 &&
            attList
              .filter(
                (v, i, a) =>
                  a.findIndex((t) => t.attendee_id === v.attendee_id) === i &&
                  v.idp_user_id != user.idpUserId
              )
              .map((item) => (
                <AttendeesListItem
                  key={`item-${item.id}`}
                  item={item}
                  {...props}
                />
              ))}
        </InfiniteScroll>
        <div className='has-text-centered mt-2'>
          {showHelpButton && (
            <button className='button is-light is-large' onClick={onHelpClick}>
              <span className='icon'>
                <i className='fa fa-question-circle'></i>
              </span>
              <span>Help Desk</span>
            </button>
          )}
          {showQAButton && (
            <button
              className='button is-light is-large ml-4'
              onClick={onQAClick}
            >
              <span className='icon'>
                <i className='fa fa-comments'></i>
              </span>
              <span>Q&A</span>
            </button>
          )}
        </div>
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
