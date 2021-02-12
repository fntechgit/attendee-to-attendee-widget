import React from 'react'
import AttendeesList, {scopes} from '../AttendeesList/AttendeesList'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

const RealTimeAttendeesList = (props) => {
  const handleTabSelect = index => {
    // if (index === 1) {
    //   setCurrShowAttendeesList([])
    // }
  }
  return (
    <div>
      <h2>
        <b>{props.title}</b>
      </h2>
      <Tabs onSelect={handleTabSelect}>
        <TabList>
          <Tab>Attendees on this page</Tab>
          <Tab>Attendees on the show</Tab>
        </TabList>
        <TabPanel><AttendeesList {...props} scope={scopes.PAGE} /></TabPanel>
        <TabPanel><AttendeesList {...props} scope={scopes.SHOW} /></TabPanel>
      </Tabs>
    </div>
  )
}

export default RealTimeAttendeesList
