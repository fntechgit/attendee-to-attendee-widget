import React from 'react'
import PropTypes from 'prop-types'
import { isMobile } from 'react-device-detect'
import style from './style.module.scss'

const AttendeesListItem = (props) => {
  if (!props.item.attendees) return null

  const {
    item: { attendees },
    onItemClick,
    onItemPicMouseEnter,
    onItemPicMouseLeave,
    onItemPicTouch
  } = props

  const attendee = {
    ...attendees,
    fullName: attendees.full_name != 'null' ? attendees.full_name : 'Private',
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
          onMouseEnter={isMobile ? null : () => onItemPicMouseEnter(attendee)}
          onMouseLeave={isMobile ? null : onItemPicMouseLeave}
        >
          <div
            className={style.picWrapper}
            onClick={isMobile ? () => onItemPicTouch(attendee) : () => onItemClick(attendee)}
          >
            <div
              className={style.pic}
              style={{ backgroundImage: `url(${attendee.pic_url})` }}
            />
          </div>
          <a
            href='#;'
            className={style.textWrapper}
            onClick={() => onItemClick(attendee)}
          >
            <div className={style.title}>{attendee.fullName}</div>
            {attendee.company && (
              <div className={style.subtitle}>
                {attendee.title ? `${attendee.title} at ` : ''}
                {attendee.company}
              </div>
            )}
          </a>
        </div>
      </li>
    )
  )
}

AttendeesListItem.propTypes = {
  item: PropTypes.any.isRequired
}

export default AttendeesListItem
