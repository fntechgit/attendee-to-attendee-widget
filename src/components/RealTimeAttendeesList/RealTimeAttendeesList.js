import React from 'react'
import PropTypes from 'prop-types'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
import List from '../Shared/List'
import style from "./style.module.scss"

const RealTimeAttendeesList = (props) => {
  const { supabaseUrl, supabaseKey } = props
  const { accessList } = useStore({ url: window.location.href, supabaseUrl, supabaseKey })
  if (accessList) {
    if (accessList.length > 0) {
      return <List component={AttendeesListItem} items={accessList} style={style} {...props} />
    }
    return <div>No info</div>
  }
  return <div>Loading...</div>
}

RealTimeAttendeesList.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired
}

export default RealTimeAttendeesList