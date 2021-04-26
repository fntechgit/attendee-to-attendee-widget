import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { AttendeeInfo } from '../AttendeeInfo/AttendeeInfo'
import style from './style.module.scss'

const AttendeesListItem = (props) => {
  const [showAttCard, setShowAttCard] = useState(false)
  let isCardHovered = false

  if (!props.item.attendees) return null

  const att = props.item.attendees

  const {
    github_user,
    linked_in_profile,
    twitter_name,
    wechat_user
  } = att.social_info

  const attendee = {
    ...att,
    fullName: att.full_name,
    picUrl: att.pic_url,
    socialInfo: {
      githubUser: github_user,
      linkedInProfile: linked_in_profile,
      twitterName: twitter_name,
      wechatUser: wechat_user
    },
    badgeFeatures: att.badges_info,
    bio: att.bio
  }

  const handleItemClick = (item) => {
    if (showAttCard) setShowAttCard(false)
    props.onItemClick(props.item)
  }

  const handleMouseEnter = () => {
    setShowAttCard(true)
  }

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!isCardHovered) setShowAttCard(false)
    }, 100)
  }

  const handleCardMouseEnter = () => {
    isCardHovered = true
  }

  const handleCardMouseLeave = () => {
    isCardHovered = false
    setShowAttCard(false)
  }

  return (
    attendee && (
      <div>
        {showAttCard && (
          <AttendeeInfo
            key={`attendee-info-${props.item.id}`}
            user={attendee}
            fullMode={true}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            onChatClick={() => handleItemClick(props.item)}
          />
        )}

        <li className={style.attendeesListItem}>
          <div
            className={style.attendeesListItemContent}
            key={`attendee-${props.item.id}`}
          >
            <div
              className={style.picWrapper}
              onClick={() => handleItemClick(props.item)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className={style.pic}
                style={{ backgroundImage: `url(${attendee.pic_url})` }}
              />
            </div>
            <div className={style.textWrapper}>
              <div className={style.title}>{attendee.full_name}</div>
              {attendee.company && (
                <div className={style.subtitle}>
                  {attendee.title ? `${attendee.title} at ` : ''}
                  {attendee.company}
                </div>
              )}
            </div>
            {/* {props.item.notification_status && (
              <div className={style.chatNotificationWrapper}>
                <FontAwesomeIcon
                  icon={
                    props.item.notification_status === 'READ'
                      ? faComment
                      : faCommentDots
                  }
                  size='2x'
                  title={
                    props.item.notification_status === 'READ'
                      ? 'Send message'
                      : 'Unread messages'
                  }
                />
              </div>
            )} */}
          </div>
        </li>
      </div>
    )
  )
}

AttendeesListItem.propTypes = {
  item: PropTypes.any.isRequired
}

export default AttendeesListItem
