import React from 'react'
import { useStore } from '../lib/Store'
import AttendeesListItem from './AttendeesListItem'
import List from './Shared/List'

const RealTimeAttendeesList = (props) => {
  const { accessList } = useStore({ url: window.location.href })
  if (accessList && accessList.length > 0) {
    //console.log(accessList)
    return <List component={AttendeesListItem} items={accessList} {...props} />
  }
  return <div>Loading...</div>
}

export default RealTimeAttendeesList