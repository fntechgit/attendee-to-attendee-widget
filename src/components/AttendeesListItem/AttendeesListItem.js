import React from 'react'
import PropTypes from 'prop-types'
import style from './style.module.scss'

const AttendeesListItem = (props) => {
  if (!props.item.attendees) return null

  const { item: {attendees}, onItemClick, onItemPicMouseEnter, onItemPicMouseLeave, onItemPicTouch } = props

  const attendee = {
    ...attendees,
    fullName: attendees.full_name,
    picUrl: attendees.pic_url,
    socialInfo: attendees.social_info,
    badgeFeatures: attendees.badges_info,
    bio: attendees.bio
  }

  return (
    attendee && (
      <li className={style.attendeesListItem}>
        <div
          className={style.attendeesListItemContent}
          key={`attendee-${props.item.id}`}
        >
          <div
            className={style.picWrapper}
            //onClick={() => onItemClick(attendee)}
            onMouseEnter={() => onItemPicMouseEnter(attendee)}
            onMouseLeave={onItemPicMouseLeave}
            onTouchStart={() => onItemPicTouch(attendee)}
          >
            <div
              className={style.pic}
              style={{ backgroundImage: `url(${attendee.pic_url})` }}
            />
          </div>
          <div className={style.textWrapper} onClick={() => onItemClick(attendee)}>
            <div className={style.title}>{attendee.full_name}</div>
            {attendee.company && (
              <div className={style.subtitle}>
                {attendee.title ? `${attendee.title} at ` : ''}
                {attendee.company}
              </div>
            )}
          </div>
        </div>
      </li>
    )
  )
}

AttendeesListItem.propTypes = {
  item: PropTypes.any.isRequired
}

export default AttendeesListItem
