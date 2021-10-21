import React from 'react'
import { withChatContext } from 'stream-chat-react'
import ReactTooltip from 'react-tooltip'
import { roles } from '../../../models/userRoles'
import {
  HelpIcon,
  QAIcon,
  CrossIcon
} from '../../../utils/predesignedImgsHelper'

import style from './style.module.scss'

const SimpleChannelHeader = (props) => {
  const { me, channel, onClose } = props

  const member = Object.values(channel.state.members).find(
    (m) => m.user.id !== me.id
  )

  if (!member) return null

  const counterpartUser = member.user

  let headerTitle = channel.data.name
  let headerSubtitle = null
  let channelImage = null

  if (counterpartUser.local_role === roles.QA) {
    headerTitle = 'Q & A'
    headerSubtitle = channel.data.description
    channelImage = <div className={style.supportPicWrapper}><QAIcon width='40' height='40' /></div>
  } else if (counterpartUser.local_role === roles.HELP) {
    headerTitle = 'Help Desk'
    channelImage = <div className={style.supportPicWrapper}><HelpIcon width='50' height='50' className={style.pic} /></div>
  } else {
    headerTitle = counterpartUser.name
    channelImage = (
      <div className={style.picWrapper}>
        <div
          className={style.pic}
          style={{ backgroundImage: `url(${counterpartUser.image})` }}
        />
      </div>
    )
    if (counterpartUser.show_fullname === false) {
      headerTitle = counterpartUser.first_name
    }
  }

  return (
    <div className={style.simpleHeader}>
      {channelImage}
      <div className={style.textWrapper}>
        <span className={style.title}>
          {headerTitle}
          {headerSubtitle && (
            <span className={style.subtitle} data-tip={headerSubtitle}>{` - ${headerSubtitle}`}</span>
          )}
        </span>
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
