import React, { useEffect, useRef } from 'react'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import { useStore } from '../../lib/store'
import {
  useAttendeesNews,
  useUpdateAttendeesNews
} from '../../lib/attendeesContext'
import { useFilterSettings } from '../../lib/filterSettingsContext'
import { scopes } from '../../models/scopes'
import { ATTENDEES_LIST_PAGE_SIZE } from '../../lib/constants'

export const MainContent = ({
  accessRepo,
  activeTab,
  activeTabContent,
  changeActiveTab,
  summitId,
  tabList,
  url
}) => {
  const attendeesList = useAttendeesNews()
  const setAttendeesList = useUpdateAttendeesNews()
  const currentFilterMode = useFilterSettings()
  const attendeesListLength = useRef(0)
  const selectedFilterScope = useRef('')

  const { attendeesNews } = useStore({
    url,
    summitId,
    accessRepository: accessRepo
  })

  const updateAttendeesList = (promise) => {
    promise
      .then((response) => {
        if (response && response.length > 0) {
          setAttendeesList(accessRepo.sortByAttName(response))
        }
      })
      .catch(console.error)
  }

  const forceFirstPageFetch = () => {
    if (
      attendeesListLength.current > 0 &&
      attendeesListLength.current < ATTENDEES_LIST_PAGE_SIZE
    ) {
      if (selectedFilterScope.current === scopes.PAGE) {
        updateAttendeesList(
          accessRepo.fetchCurrentPageAttendees(url, 0, ATTENDEES_LIST_PAGE_SIZE)
        )
      } else {
        updateAttendeesList(
          accessRepo.fetchCurrentShowAttendees(0, ATTENDEES_LIST_PAGE_SIZE)
        )
      }
    }
  }

  const onVisibilitychange = (_) => {
    if (document.visibilityState === 'visible') {
      // ensure first list page fetch on tab focus in case real-time isn't working properly
      forceFirstPageFetch()
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilitychange)
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilitychange)
      }
    }
  }, [])

  // handle real-time updates
  useEffect(() => {
    if (attendeesNews && Object.keys(attendeesNews).length > 0) {
      console.log('rt att news', attendeesNews.id)
      //merge news
      let mergedList = accessRepo.mergeChanges(attendeesList, attendeesNews)

      if (currentFilterMode === scopes.PAGE) {
        mergedList = accessRepo.filterSameURLAttendees(mergedList, url)
      }

      if (mergedList && mergedList.length > 0) {
        attendeesListLength.current = mergedList.length
        setAttendeesList(mergedList)
      }
    }
  }, [attendeesNews])

  useEffect(() => {
    selectedFilterScope.current = currentFilterMode
    forceFirstPageFetch()
  }, [currentFilterMode])

  return (
    <div className='mt-2'>
      <Tabs
        tabList={tabList}
        activeTab={activeTab}
        changeActiveTab={changeActiveTab}
      />
      {accessRepo && (
        <ActiveTabContent key={activeTab} content={activeTabContent()} />
      )}
    </div>
  )
}
