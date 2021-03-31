import React, { useEffect } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList, { scopes } from '../AttendeesList/AttendeesList'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

let accessRepo = null
let chatRepo = null

const RealTimeAttendeesList = (props) => {

  const { supabaseUrl, supabaseKey, user } = props

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey, null)
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey, user)
  }

  const handleTabSelect = (index) => {
    // if (index === 1) {
    //   setCurrShowAttendeesList([])
    // }
  }

  return (
    <div>
      <h3>
        <b>{props.title}</b>
      </h3>
      <Tabs onSelect={handleTabSelect}>
        <TabList>
          <Tab>Attendees on this page</Tab>
          <Tab>Attendees at the show</Tab>
        </TabList>
        <TabPanel>
          <AttendeesList {...props} accessRepo={accessRepo} chatRepo={chatRepo} scope={scopes.PAGE} />
        </TabPanel>
        <TabPanel>
          <AttendeesList {...props} accessRepo={accessRepo} chatRepo={chatRepo} scope={scopes.SHOW} />
        </TabPanel>
      </Tabs>
    </div>
  )
}

export default RealTimeAttendeesList
