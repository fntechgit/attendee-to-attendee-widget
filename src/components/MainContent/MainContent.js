import React, { useEffect } from 'react'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import { useStore } from '../../lib/store'
import { useAttendeesNews, useUpdateAttendeesNews } from '../../lib/attendeesContext'

export const MainContent = ({ accessRepo, tabList, activeTab, url, summitId, changeActiveTab, activeTabContent }) => {

  const attendeesList = useAttendeesNews()
  const setAttendeesList = useUpdateAttendeesNews() 

  const { attendeesNews } = useStore({
    url,
    summitId,
    accessRepository: accessRepo
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
    if (attendeesNews && Object.keys(attendeesNews).length > 0) {
      console.log('rt att news', attendeesNews.id)
      // merge news
      updateAttendeesList(accessRepo.mergeChanges(attendeesList, attendeesNews))
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
