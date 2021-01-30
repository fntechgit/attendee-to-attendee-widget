import React from 'react'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import List from '../Shared/List'
import style from "./style.module.scss"

const RealTimeAttendeesList = (props) => {
  const { accessList } = useStore({ url: window.location.href })
  if (accessList) {
    if (accessList.length > 0) {
      return <List component={AttendeesListItem} items={accessList} style={style} {...props} />
    }
    return <div>No data</div>
  }
  return <div>Loading...</div>
}

export default RealTimeAttendeesList