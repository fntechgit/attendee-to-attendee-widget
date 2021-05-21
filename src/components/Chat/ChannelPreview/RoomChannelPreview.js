import React, { useEffect, useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { channelTypes } from '../../../models/channel_types'
import { adminRole, allHelpRoles } from '../../../models/local_roles'

import styles from './style.module.scss'

const RoomChannelPreview = ({
  client,
  channel,
  setActiveChannel,
  onItemClick,
  onDelete
}) => {
  const allowDeletion = client.user.local_role === adminRole
  const [showDelete, setShowDelete] = useState(false)
  const [title, setTitle] = useState(channel.data.name)

  useEffect(() => {
    if (
      channel.type === channelTypes.HELP_ROOM ||
      channel.type === channelTypes.QA_ROOM
    ) {
      const imHelpUser = allHelpRoles.includes(client.user.local_role)

      if (imHelpUser) {
        //Get the user who needs support
        const member = Object.values(channel.state.members).find(
          (m) => !allHelpRoles.includes(m.user.role)
        )

        setTitle(
          channel.type === channelTypes.QA_ROOM
            ? `${member.user.name} have a question`
            : `${member.user.name} help request`
        )
      }
    }
  }, [])

  const onClick = async (ev) => {
    ev.preventDefault()
    await channel.markRead()
    setActiveChannel(channel)
    if (onItemClick) onItemClick(channel)
  }

  const handleDelete = async (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    setActiveChannel(channel)
    if (onDelete) onDelete(channel)
  }

  return (
    <div
      className={styles.channelPreview}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
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
                    {channel.data.member_count} Participants
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
