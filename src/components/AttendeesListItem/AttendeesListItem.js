import React from 'react'
import PropTypes from 'prop-types'
import style from "./style.module.scss"

const AttendeesListItem = (props) => {
  const attendee = props.item.attendees

  return (
    <li className={style.attendeesListItem}>
      <div className={style.attendeesListItemContent} key={`attendee-${props.item.id}`} onClick={() => props.onItemClick(props.item)}>
        <div className={style.picWrapper}>
          <div
            className={style.pic}
            style={{ backgroundImage: `url(${attendee.pic_url})` }}
          />
        </div>
        <div className={style.text}>
           {attendee.full_name} ({attendee.email})
        </div>
      </div>
    </li>
  )
}

AttendeesListItem.propTypes = {
  item: PropTypes.any.isRequired
}

export default AttendeesListItem
