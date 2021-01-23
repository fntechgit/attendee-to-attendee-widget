import React from 'react'
import PropTypes from 'prop-types'
import styles from "../styles/styles.module.scss"

const AttendeesListItem = (props) => {
  const attendee = props.item.attendees
  return (
    <li className={styles.attendeesListItem}>
      <div className={styles.attendeesListItemContent} key={`attendee-${props.item.id}`}>
        <div className={styles.picWrapper}>
          <div
            className={styles.pic}
            style={{ backgroundImage: `url(${attendee.pic_url})` }}
          />
        </div>
        <div className={styles.nameWrapper}>
          <div className={styles.name}>
            {attendee.full_name} - {attendee.email} - {props.item.attendee_ip} - {props.item.current_url}
          </div>
        </div>
      </div>
    </li>
  )
}

AttendeesListItem.propTypes = {
  item: PropTypes.any
}

export default AttendeesListItem
