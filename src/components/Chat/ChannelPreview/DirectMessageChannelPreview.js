import React, { useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { allHelpRoles } from '../../../models/local_roles'

import styles from './style.module.scss'

const UserChannelPreview = ({
  client,
  channel,
  member,
  latestMessage,
  unread,
  onClick,
  onDelete
}) => {
  const [showDelete, setShowDelete] = useState(false)
  let name = member.user.name
  const statusClass = member.user.online ? styles.online : styles.offline

  if (allHelpRoles.includes(client.user.local_role)) {
    name = `${channel.id.includes('help') ? 'Help' : 'Q&A'} - ${name}`
  }

  return (
    <div
      className={styles.channelPreview}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
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
                  {name}
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
  const isSupportUser = allHelpRoles.includes(client.user.local_role)

  const memberLookup = (m) => {
    if (isSupportUser) {
      return m.role === 'owner'
    } else {
      return m.user.id !== client.user.id
    }
  }

  const member = Object.values(channel.state.members).find(memberLookup)

  const onChannelClick = async (ev) => {
    ev.preventDefault()
    await channel.markRead()
    setActiveChannel(channel)
    if (onItemClick) onItemClick(channel)
  }

  const onDelete = async (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    setActiveChannel(null)
    const response = await channel.hide()
    // const state = await channel.watch();
    await channel.stopWatching()
  }

  if (!member) return null

  if (
    isSupportUser ||
    (!channel.id.includes('-qa') && !channel.id.includes('-help'))
  ) {
    return (
      <UserChannelPreview
        client={client}
        channel={channel}
        member={member}
        latestMessage={latestMessage}
        unread={unread}
        onDelete={onDelete}
        onClick={onChannelClick}
      />
    )
  }
  return null
}

export default withChatContext(DirectMessageChannelPreview)
