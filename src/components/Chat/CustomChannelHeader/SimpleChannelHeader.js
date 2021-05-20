import React, { useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { channelTypes } from '../../../models/channel_types'
//import { allHelpRoles } from '../../../models/local_roles'
import style from './style.module.scss'

const SimpleChannelHeader = (props) => {
  const { me, channel, onClose } = props

  // const isHelpUser = allHelpRoles.includes(me.local_role)
  // const memberLookup = (m) =>
  //   isHelpUser ? m.role === 'owner' : m.user.id !== me.id

  // const member = Object.values(members).find(memberLookup)

  // let headerTitle = member.user.name

  // if (isHelpUser) {
  //   const channelType = props.channel.id.includes('help') ? 'Help' : 'Q&A'
  //   headerTitle = `${channelType} - ${member.user.name}`
  // } else {
  //   if (props.channel.id === `${me.id}-help`) {
  //     headerTitle = 'Support'
  //   } else if (props.channel.id === `${me.id}-qa`) {
  //     headerTitle = 'Q&A'
  //   }
  // }

  const member = Object.values(channel.state.members).find(
    (m) => m.user.id !== me.id
  )

  let headerImage = channel.data.image
  let headerTitle = channel.data.name

  if (channel.type === channelTypes.MESSAGING && member) {
    headerImage = member.user.image
    headerTitle = member.user.name
  }

  return (
    <div className={style.simpleHeader}>
      <div className={style.picWrapper}>
        <div
          className={style.pic}
          style={{ backgroundImage: `url(${headerImage})` }}
        />
      </div>
      <div className={style.textWrapper}>
        <span className={style.title}>{headerTitle}</span>
        {(channel.type === channelTypes.CUSTOM_ROOM ||
          channel.type === channelTypes.ACTIVITY_ROOM) && (
          <span className={style.subtitle}>{5} participants</span>
        )}
      </div>
      <div className={style.controls}>
        <div onClick={onClose} className={style.close}>
          <svg
            width='10px'
            height='10px'
            viewBox='0 0 365.696 365.696'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='m243.1875 182.859375 113.132812-113.132813c12.5-12.5 12.5-32.765624 0-45.246093l-15.082031-15.082031c-12.503906-12.503907-32.769531-12.503907-45.25 0l-113.128906 113.128906-113.132813-113.152344c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503907-12.5 32.769531 0 45.25l113.152344 113.152344-113.128906 113.128906c-12.503907 12.503907-12.503907 32.769531 0 45.25l15.082031 15.082031c12.5 12.5 32.765625 12.5 45.246093 0l113.132813-113.132812 113.128906 113.132812c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082031c12.5-12.503906 12.5-32.769531 0-45.25zm0 0' />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default withChatContext(SimpleChannelHeader)
