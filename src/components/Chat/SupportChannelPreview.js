import React from 'react'
import { withChatContext } from 'stream-chat-react'

import style from './style.module.scss'

import { allHelpRoles } from '../../models/local_roles'

const SupportChannelPreview = ({ channel, title, unread, onClick }) => {
  const blink = unread ? style.blink : ''

  return (
    <div
      className={`${style.channel} ${style.helpChannel} ${blink} list-group-item`}
    >
      <a href='' id={`channel-${channel.id}`} onClick={onClick}>
        <div className={style.info}>
          <div className={style.name}>{title}</div>
        </div>
      </a>
    </div>
  )
}

class CustomChannelPreview extends React.Component {
  onChannelClick = (ev) => {
    const { setActiveChannel, channel } = this.props
    ev.preventDefault()
    setActiveChannel(channel)
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

    if (channel.id === `${client.user.id}-qa`) {
      return (
        <SupportChannelPreview
          channel={channel}
          title='Enter your Q&A here !'
          latestMessage={latestMessage}
          unread={unread}
          onClick={this.onChannelClick}
        />
      )
    } else if (channel.id === `${client.user.id}-help`) {
      return (
        <SupportChannelPreview
          channel={channel}
          title='Need some help?'
          latestMessage={latestMessage}
          unread={unread}
          onClick={this.onChannelClick}
        />
      )
    }

    return null
  }
}

export default withChatContext(CustomChannelPreview)
