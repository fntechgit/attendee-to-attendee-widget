import React, { useEffect, useRef } from 'react'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import { useStore } from '../../lib/store'
import {
  useAttendeesNews,
  useUpdateAttendeesNews
} from '../../lib/attendeesContext'
import { ATTENDEES_LIST_PAGE_SIZE } from '../../lib/constants'

export const MainContent = ({
  accessRepo,
  tabList,
  activeTab,
  url,
  summitId,
  changeActiveTab,
  activeTabContent
}) => {
  const attendeesList = useAttendeesNews()
  const setAttendeesList = useUpdateAttendeesNews()
  const attendeesListLength = useRef(0)

  const { attendeesNews } = useStore({
    url,
    summitId,
    accessRepository: accessRepo
  })

  // ensure first list page fetch on tab focus in case real-time isn't working properly
  const onVisibilitychange = (_) => {
    if (document.visibilityState === 'visible') {
      if (
        attendeesListLength.current > 0 &&
        attendeesListLength.current < ATTENDEES_LIST_PAGE_SIZE
      ) {
        console.log('fetching first att list page...')
        accessRepo
          .fetchCurrentShowAttendees(0, ATTENDEES_LIST_PAGE_SIZE)
          .then((response) => {
            if (response && response.length > 0) {
              setAttendeesList(accessRepo.sortByAttName(response))
            }
          })
      }
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
      const mergedList = accessRepo.mergeChanges(attendeesList, attendeesNews)
      if (mergedList && mergedList.length > 0) {
        attendeesListLength.current = mergedList.length
        setAttendeesList(mergedList)
      }
    }
  }, [attendeesNews])

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
