import React, { useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { isMobile } from 'react-device-detect'
import { roles } from '../../../models/userRoles'

import styles from './style.module.scss'

const UserChannelPreview = ({
  channel,
  member,
  title,
  latestMessage,
  unread,
  onClick,
  onDelete
}) => {
  const [showDelete, setShowDelete] = useState(isMobile)
  const statusClass = member.user.online ? styles.online : styles.offline

  return (
    <div
      className={styles.channelPreview}
      onMouseEnter={isMobile ? null : () => setShowDelete(true)}
      onMouseLeave={isMobile ? null : () => setShowDelete(false)}
    >
      <div className={`${styles.channel} list-group-item`}>
        <a href='' id={`channel-${channel.id}`} onClick={onClick}>
          <div className={`${styles.channelPreview} ${statusClass}`}>
            <div className={styles.pic}>
              <img src={member.user.image} alt='' />
              <div className={styles.status} />
            </div>
            <div className={styles.info}>
              <div>
                <div className={styles.name} data-user={member.user.id}>
                  {title}
                </div>
              </div>
              {latestMessage && (
                <div
                  className={`${styles.lastMessage} ${
                    unread ? styles.unread : null
                  }`}
                >
                  {latestMessage}
                </div>
              )}
            </div>
          </div>
          {showDelete && (
            <div className={styles.delete} onClick={onDelete}>
              <svg
                width='20'
                height='20'
                viewBox='0 0 30 30'
                fill='gray'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M15 13.5858L21.364 7.22183L22.7782 8.63604L16.4143 15L22.7782 21.364L21.364 22.7782L15 16.4142L8.63608 22.7782L7.22187 21.364L13.5858 15L7.22187 8.63604L8.63608 7.22183L15 13.5858Z'
                />
              </svg>
            </div>
          )}
          {channel.state.unreadCount > 0 && (
            <div className={styles.unreadCount}>
              <span>{channel.state.unreadCount}</span>
            </div>
          )}
        </a>
      </div>
    </div>
  )
}

const DirectMessageChannelPreview = (props) => {
  const {
    channel,
    setActiveChannel,
    latestMessage,
    unread,
    client,
    onItemClick
  } = props

  const onChannelClick = async (ev) => {
    ev.preventDefault()
    if (channel.disconnected) return
    await channel.markRead()
    setActiveChannel(channel)
    if (onItemClick) onItemClick(channel)
  }

  const onDelete = async (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    if (channel.disconnected) return
    setActiveChannel(null)
    const response = await channel.hide()
    // const state = await channel.watch();
    await channel.stopWatching()
  }

  const userRole = client.user.local_role

  const memberLookup = (m) => {
    if (userRole === roles.HELP || userRole === roles.QA) {
      //Get the user who needs support
      return m.role === 'owner'
    } else {
      return m.user.id !== client.user.id
    }
  }
  const member = Object.values(channel.state.members).find(memberLookup)

  if (!member) return null

  const { user } = member

  let memberName = user.name

  if (user.show_fullname === false) {
    memberName = user.first_name
  }

  let title = memberName

  if (userRole === roles.QA || userRole === roles.HELP) {
    //Agent point of view
    title =
      userRole === roles.QA
        ? `${memberName} have a question`
        : `${memberName} help request`
  } else {
    //Attendee point of view
    if (user.local_role === roles.QA) title += ' (Q&A)'
    else if (user.local_role === roles.HELP) title += ' (Help Desk)'
  }

  return (
    <UserChannelPreview
      client={client}
      channel={channel}
      member={member}
      title={title}
      latestMessage={latestMessage}
      unread={unread}
      onDelete={onDelete}
      onClick={onChannelClick}
    />
  )
}

export default withChatContext(DirectMessageChannelPreview)
