import { withChatContext } from 'stream-chat-react'
import React from 'react'
import style from './style.module.scss'
import { allHelpRoles } from '../../../models/local_roles'

class CustomHeader extends React.PureComponent {
  render() {
    const {
      me,
      channel: {
        state: { members }
      }
    } = this.props
    const isHelpUser = allHelpRoles.includes(me.local_role)
    const memberLookup = (m) => {
      if (isHelpUser) {
        return m.role === 'owner'
      } else {
        return m.user.id !== me.id
      }
    }

    const member = Object.values(members).find(memberLookup)

    let headerTitle = ''

    if (isHelpUser) {
      const channelType = this.props.channel.id.includes('help')
        ? 'Help'
        : 'Q&A'
      headerTitle = `${channelType} - ${member.user.name}`
    } else {
      if (this.props.channel.id === `${me.id}-help`) {
        headerTitle = 'Support'
      } else if (this.props.channel.id === `${me.id}-qa`) {
        headerTitle = 'Q&A'
      } else {
        headerTitle = member.user.name
      }
    }

    return (
      <div className={style.header}>
        <div className={style.picWrapper}>
          <div
            className={style.pic}
            style={{ backgroundImage: `url(${member.user.image})` }}
          />
        </div>
        <span className={style.name}>{headerTitle}</span>
        <a href='' onClick={this.props.onClose} className={style.close}>
          <div className={style.icon}>
            <svg
              width='10px'
              height='10px'
              viewBox='0 0 365.696 365.696'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='m243.1875 182.859375 113.132812-113.132813c12.5-12.5 12.5-32.765624 0-45.246093l-15.082031-15.082031c-12.503906-12.503907-32.769531-12.503907-45.25 0l-113.128906 113.128906-113.132813-113.152344c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503907-12.5 32.769531 0 45.25l113.152344 113.152344-113.128906 113.128906c-12.503907 12.503907-12.503907 32.769531 0 45.25l15.082031 15.082031c12.5 12.5 32.765625 12.5 45.246093 0l113.132813-113.132812 113.128906 113.132812c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082031c12.5-12.503906 12.5-32.769531 0-45.25zm0 0' />
            </svg>
          </div>
        </a>
      </div>
    )
  }
}

export default withChatContext(CustomHeader)
