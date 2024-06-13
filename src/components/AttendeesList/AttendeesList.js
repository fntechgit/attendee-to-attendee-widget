/**
 * Copyright 2021 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import {
  useAttendeesNews,
  useUpdateAttendeesNews
} from '../../lib/attendeesContext'
import { useFilterSettings, useUpdateFilterSettings } from '../../lib/filterSettingsContext'
import { ATTENDEES_LIST_PAGE_SIZE } from '../../lib/constants'
import { scopes } from '../../models/scopes'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import { SearchBar } from '../SearchBar/SearchBar'
import InfiniteScroll from 'react-infinite-scroll-component'

import style from './style.module.scss'

let urlAccessesPageIx = 0
let showAccessesPageIx = 0

const AttendeesList = (props) => {
  const {
    accessRepo,
    onHelpClick,
    onQAClick,
    showHelpButton,
    showQAButton,
    url,
    user
  } = props
  const [hasMore, setHasMore] = useState(true)
  const [filteredAttendeesList, setFilteredAttendeesList] = useState(null)

  const attendeesList = useAttendeesNews()
  const setAttendeesList = useUpdateAttendeesNews()
  const currentFilterMode = useFilterSettings()
  const setFilterMode = useUpdateFilterSettings()

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
      if (currentFilterMode === scopes.PAGE) {
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
    if (currentFilterMode === scopes.PAGE) {
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
    setFilterMode(mode === 0 ? scopes.SHOW : scopes.PAGE)
  }

  const attList = filteredAttendeesList ? filteredAttendeesList : attendeesList

  if (attList) {
    return (
      <div className={style.outerWrapper}>
        <SearchBar
          onSearch={(e) => handleSearch(e.target.value, currentFilterMode)}
          onFilterModeChange={handleFilterModeChange}
          filterMenuOptions={['All Attendees', 'In this Room']}
          defaultMenuIx={currentFilterMode === scopes.SHOW ? 0 : 1}
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
            <button className={`${style.button} button is-large`} onClick={onHelpClick}>
              <span className='icon'>
                <i className='fa fa-question-circle'></i>
              </span>
              <span>Help Desk</span>
            </button>
          )}
          {showQAButton && (
            <button
              className={`${style.button} button is-large ml-4`}
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
