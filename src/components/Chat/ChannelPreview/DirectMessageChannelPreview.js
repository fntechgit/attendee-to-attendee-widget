/**
 * Copyright 2021 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React, { useState } from 'react'
import { withChatContext } from 'stream-chat-react'
import { isMobile } from 'react-device-detect'
import ReactTooltip from 'react-tooltip'
import { channelTypes } from '../../../models/channelTypes'
import { roles } from '../../../models/userRoles'
import {
  HelpIcon,
  QAIcon,
  CrossIcon
} from '../../../utils/predesignedImgsHelper'

import style from './style.module.scss'

const UserChannelPreview = ({
  channel,
  member,
  latestMessage,
  unread,
  title,
  pic,
  onClick,
  onDelete
}) => {
  const [showDelete, setShowDelete] = useState(isMobile)
  const statusClass = member.user.online ? style.online : style.offline

  return (
    <div
      className={style.channelPreview}
      onMouseEnter={isMobile ? null : () => setShowDelete(true)}
      onMouseLeave={isMobile ? null : () => setShowDelete(false)}
    >
      <div className={`${style.channel} list-group-item`}>
        <a href='' id={`channel-${channel.id}`} onClick={onClick}>
          <div className={`${style.channelPreview} ${statusClass}`}>
            <div className={style.pic}>
              {pic}
              <div className={style.status} />
            </div>
            <div className={style.info}>
              <div>
                <div
                  className={style.name}
                  data-user={member.user.id}
                  data-tip={title.length > 30 ? title : null}
                >
                  {title}
                </div>
              </div>
              {latestMessage && (
                <div
                  className={`${style.lastMessage} ${
                    unread ? style.unread : null
                  }`}
                >
                  {latestMessage}
                </div>
              )}
            </div>
          </div>
          {showDelete && (
            <div className={style.delete} onClick={onDelete}>
              <CrossIcon width='20' height='20' />
            </div>
          )}
          {channel.state.unreadCount > 0 && (
            <div className={style.unreadCount}>
              <span>{channel.state.unreadCount}</span>
            </div>
          )}
        </a>
      </div>
      <ReactTooltip place='top' effect='solid' />
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

  const getCounterpartMember = (currentUserId, members, isSupport) => {
    const member = Object.values(members).find((m) => {
      if (isSupport) {
        //Get the user who needs support (channel owner)
        return m.role === 'owner'
      } else {
        return m.user.id !== currentUserId
      }
    })
    return member
  }

  const setupItem = (currUser, counterpartUser, channel) => {
    let memberName =
      counterpartUser.show_fullname === false
        ? counterpartUser.first_name
        : counterpartUser.name

    let title = memberName
    let pic = <img src={counterpartUser.image} alt='' />

    const userRole = currUser.local_role
    if (userRole === roles.QA || userRole === roles.HELP) {
      //Agent point of view
      title =
        userRole === roles.QA
          ? `${memberName} has a question`
          : `${memberName} help request`
    } else {
      //Attendee point of view
      if (counterpartUser.local_role === roles.QA ||
        channel.type === channelTypes.QA_ROOM) {
        title = 'Q & A'
        pic = <QAIcon width='50' height='50' />
      } else if (counterpartUser.local_role === roles.HELP ||
        channel.type === channelTypes.HELP_ROOM) {
        title = 'Help Desk'
        pic = <HelpIcon width='50' height='50' />
      }
    }
    return { title: title, pic: pic }
  }

  const userRole = client.user.local_role
  const isSupportAgent = userRole === roles.HELP || userRole === roles.QA
  const member = getCounterpartMember(
    client.user.id,
    channel.state.members,
    isSupportAgent
  )

  if (!member) return null

  const { title, pic } = setupItem(client.user, member.user, channel)

  return (
    <UserChannelPreview
      channel={channel}
      member={member}
      latestMessage={latestMessage}
      unread={unread}
      title={title}
      pic={pic}
      onDelete={onDelete}
      onClick={onChannelClick}
    />
  )
}

export default withChatContext(DirectMessageChannelPreview)
