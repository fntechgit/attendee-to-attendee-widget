import React from 'react'
import { withChatContext } from 'stream-chat-react'
import User from './User'
import styles from './style.module.scss'

import { allHelpRoles } from '../../../models/local_roles'

const UserChannelPreview = ({
  client,
  channel,
  member,
  latestMessage,
  unread,
  onClick,
  onDelete
}) => {
  const lastMessage = channel.state.messages[0]
  let name = member.user.name

  if (allHelpRoles.includes(client.user.local_role)) {
    name = `${channel.id.includes('help') ? 'Help' : 'Q&A'} - ${name}`
  }

  return (
    <div className={styles.channelPreview}>
      <div className={`${styles.channel} list-group-item`}>
        <a href='' id={`channel-${channel.id}`} onClick={onClick}>
          <User user={member.user}>
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
          </User>
          {/* <div className={styles.delete} onClick={onDelete}>
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
          </div> */}
          <div className={styles.unreadCount}>
            <span>{channel.state.unreadCount}</span>
          </div>
        </a>
      </div>
    </div>
  )
}

class CustomChannelPreview extends React.Component {
  onChannelClick = (ev) => {
    const { setActiveChannel, channel } = this.props
    ev.preventDefault()
    setActiveChannel(channel)
  }

  onDelete = async (ev) => {
    const { channel, setActiveChannel } = this.props
    ev.preventDefault()
    ev.stopPropagation()
    setActiveChannel(null)
    const response = await channel.hide()
    // const state = await channel.watch();
    await channel.stopWatching()
  }

  render() {
    const { channel, latestMessage, unread, client } = this.props
    const isSupportUser = allHelpRoles.includes(client.user.local_role)
    const memberLookup = (m) => {
      if (isSupportUser) {
        return m.role === 'owner'
      } else {
        return m.user.id !== client.user.id
      }
    }
    const member = Object.values(channel.state.members).find(memberLookup)

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
          onDelete={this.onDelete}
          onClick={this.onChannelClick}
        />
      )
    }

    return null
  }
}

export default withChatContext(CustomChannelPreview)
