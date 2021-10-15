import React, { useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { isMobile } from 'react-device-detect'
import { channelTypes } from '../../../models/channelTypes'
import { permissions } from '../../../models/permissions'

import styles from './style.module.scss'

const RoomChannelPreview = ({
  user,
  channel,
  setActiveChannel,
  onItemClick,
  onDelete
}) => {
  const allowDeletion = user.hasPermission(permissions.MANAGE_ROOMS)
  const [showDelete, setShowDelete] = useState(isMobile)

  const title = channel.data.name

  const onClick = async (ev) => {
    ev.preventDefault()
    if (channel.disconnected) return
    await channel.markRead()
    setActiveChannel(channel)
    if (onItemClick) onItemClick(channel)
  }

  const handleDelete = async (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    if (channel.disconnected) return
    setActiveChannel(channel)
    if (onDelete) onDelete(channel)
  }

  return (
    <div
      className={styles.channelPreview}
      onMouseEnter={isMobile ? null : () => setShowDelete(true)}
      onMouseLeave={isMobile ? null : () => setShowDelete(false)}
    >
      <div className={`${styles.channel} list-group-item`}>
        <a href='' id={`channel-${channel.id}`} onClick={onClick}>
          <div className={`${styles.channelPreview}`}>
            <div className={styles.pic}>
              <img src={channel.data.image} alt='' />
              <div className={styles.status} />
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{title}</div>
              {channel.type !== channelTypes.QA_ROOM &&
                channel.type !== channelTypes.HELP_ROOM && (
                  <div className={styles.participants}>
                    {channel.data.member_count ? `${channel.data.member_count} Participants` : '' }
                  </div>
                )}
            </div>
          </div>
          {channel.state.unreadCount > 0 && (
            <div className={styles.unreadCount}>
              <span>{channel.state.unreadCount}</span>
            </div>
          )}
          {allowDeletion && showDelete && (
            <div className={styles.delete} onClick={handleDelete}>
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
        </a>
      </div>
    </div>
  )
}

export default withChatContext(RoomChannelPreview)
