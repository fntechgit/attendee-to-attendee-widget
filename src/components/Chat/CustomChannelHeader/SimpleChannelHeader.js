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

import React from 'react'
import { withChatContext } from 'stream-chat-react'
import ReactTooltip from 'react-tooltip'
import { channelTypes } from '../../../models/channelTypes'
import { roles } from '../../../models/userRoles'
import {
  HelpIcon,
  QAIcon,
  CrossIcon
} from '../../../utils/predesignedImgsHelper'

import style from './style.module.scss'

const SimpleChannelHeader = (props) => {
  const { me, client, channel, onClose } = props

  const buildRawAttendeePic = (image) => {
    return (
      <div className={style.picWrapper}>
        <div
          className={style.pic}
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
    )
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

  const userRole = client.user.local_role
  const isSupportAgent = userRole === roles.HELP || userRole === roles.QA
  let headerTitle = channel.data.name
  let headerSubtitle = null
  let channelImage = null

  const member = getCounterpartMember(
    client.user.id,
    channel.state.members,
    isSupportAgent
  )

  if (!member) return null

  const counterpartUser = member.user

  let memberName =
    counterpartUser.show_fullname === false
      ? counterpartUser.first_name
      : counterpartUser.name

  if (userRole === roles.QA || userRole === roles.HELP) {
    //Agent point of view
    headerTitle =
      userRole === roles.QA
        ? `${memberName} has a question`
        : `${memberName} help request`
    headerSubtitle = channel.data.description
    channelImage = buildRawAttendeePic(counterpartUser.image)
  } else {
    //Attendee point of view
    if (counterpartUser.local_role === roles.QA ||
        channel.type === channelTypes.QA_ROOM) {
      headerTitle = 'Q & A'
      headerSubtitle = channel.data.description
      channelImage = (
        <div className={style.supportPicWrapper}>
          <QAIcon width='40' height='40' />
        </div>
      )
    } else if (counterpartUser.local_role === roles.HELP || 
      channel.type === channelTypes.HELP_ROOM) {
      headerTitle = 'Help Desk'
      channelImage = (
        <div className={style.supportPicWrapper}>
          <HelpIcon width='50' height='50' className={style.pic} />
        </div>
      )
    } else {
      headerTitle = counterpartUser.name
      channelImage = buildRawAttendeePic(counterpartUser.image)
      if (counterpartUser.show_fullname === false) {
        headerTitle = counterpartUser.first_name
      }
    }
  }

  return (
    <div className={style.simpleHeader}>
      {channelImage}
      <div className={style.textWrapper}>
        <span className={style.title} data-tip={headerTitle}>
          {headerTitle}
        </span>
        {headerSubtitle && (
          <span
            className={style.subtitle}
            data-tip={headerSubtitle}
          >{` - ${headerSubtitle}`}</span>
        )}
      </div>
      <div className={style.controls}>
        <div onClick={onClose} className={style.close}>
          <CrossIcon width='20' height='20' />
        </div>
      </div>
      <ReactTooltip place='top' effect='solid' />
    </div>
  )
}

export default withChatContext(SimpleChannelHeader)
