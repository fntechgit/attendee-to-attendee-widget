import React, { useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { isMobile } from 'react-device-detect'
import { channelTypes } from '../../../models/channelTypes'
import { permissions } from '../../../models/permissions'
import { CrossIcon } from '../../../utils/predesignedImgsHelper'

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
  const subtitle = channel.data.description

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
                    {/* {channel.data.member_count ? `${channel.data.member_count} Participants` : '' } */}
                    {subtitle}
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
              <CrossIcon width='20' height='20' />
            </div>
          )}
        </a>
      </div>
    </div>
  )
}

export default withChatContext(RoomChannelPreview)
