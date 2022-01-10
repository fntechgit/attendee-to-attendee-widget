import React from 'react'
import PropTypes from 'prop-types'
import { isMobile } from 'react-device-detect'
import style from './style.module.scss'

const AttendeesListItem = (props) => {
  if (!props.item) return null

  const {
    item,
    onItemClick,
    onItemPicMouseEnter,
    onItemPicMouseLeave,
    onItemPicTouch
  } = props

  const attendee = {
    ...item,
    fullName: item.full_name && item.full_name != 'null' ? item.full_name : 'Private',
    picUrl: item.pic_url,
    socialInfo: item.social_info,
    badgeFeatures: item.badges_info,
    bio: item.bio
  }

  return (
    attendee && (
      <li className={style.attendeesListItem}>
        <div
          className={style.attendeesListItemContent}
          key={`attendee-${item.id}`}
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
          <div
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
