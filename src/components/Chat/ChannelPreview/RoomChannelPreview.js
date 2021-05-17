import React from 'react'
import { withChatContext } from 'stream-chat-react'

import styles from './style.module.scss'

const RoomChannelPreview = ({ channel, setActiveChannel, onItemClick }) => {
  const onClick = async (ev) => {
    ev.preventDefault()
    await channel.markRead()
    setActiveChannel(channel)
    if (onItemClick) onItemClick(channel)
  }

  return (
    <div className={styles.channelPreview}>
      <div className={`${styles.channel} list-group-item`}>
        <a href='' id={`channel-${channel.id}`} onClick={onClick}>
          <div className={`${styles.channelPreview}`}>
            <div className={styles.pic}>
              <img src={channel.data.image} alt='' />
              <div className={styles.status} />
            </div>
            <div className={styles.info}>
              <div>
                <div className={styles.name}>{channel.data.name}</div>
              </div>
              <div className={styles.participants}>
                {channel.data.member_count} Participants
              </div>
            </div>
          </div>
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

export default withChatContext(RoomChannelPreview)
