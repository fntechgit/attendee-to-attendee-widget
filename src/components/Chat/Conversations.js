import React, { Component } from 'react'
import { Chat, LoadingIndicator, withChatContext } from 'stream-chat-react'
import ChatChannelsBuilder from '../../lib/ChatChannelsBuilder'
import ConversationBox from './ConversationBox'
import SupportChannelPreview from './SupportChannelPreview'
import { allHelpRoles, helpRoles, qaRoles } from '../../models/local_roles'

import style from './style.module.scss'
import 'stream-chat-react/dist/css/index.css'

class Conversations extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      qaChannel: null,
      helpChannel: null
    }
    this._channelsBuilder = new ChatChannelsBuilder()
    this._currChannel
  }

  async componentDidMount() {
    const { user, chatClient, showHelp, showQA } = this.props
    const isHelpUser = helpRoles.includes(user.local_role)
    const isQaUser = qaRoles.includes(user.local_role)
    const isSupportUser = isQaUser || isHelpUser

    // console.log('Conversations.componentDidMount isSupportUser', isQaUser)
    // console.log('Conversations.componentDidMount showQA', showQA)
    // console.log('Conversations.componentDidMount showHelp', showHelp)

    // if (!isSupportUser) {
    //   // create QA channel between this user and qa users
    //   if (showQA) {
    //     const qaChannel = await this._channelsBuilder.createSupportChannel('qa')
    //     this.setState({ qaChannel })
    //   }
    //   // create Help channel between this user and help user
    //   if (showHelp) {
    //     const helpChannel = await this._channelsBuilder.createSupportChannel('help')
    //     this.setState({ helpChannel })
    //   }
    // }
    this._currChannel = await this._channelsBuilder.startConversation(
      this.props.partnerId,
      chatClient,
      user,
      this.props.setActiveChannel
    )

    this.setState({ loaded: true })
  }

  getQAChannel = () => {
    const { user, showQA } = this.props
    const { qaChannel } = this.state
    const isSupportUser = allHelpRoles.includes(user.local_role)

    if (!showQA || isSupportUser || !qaChannel) return null

    return <SupportChannelPreview channel={qaChannel} key='channel-list-qa' />
  }

  getHelpChannel = () => {
    const { user, showHelp } = this.props
    const { helpChannel } = this.state
    const isSupportUser = allHelpRoles.includes(user.local_role)

    if (!showHelp || isSupportUser || !helpChannel) return null

    return (
      <SupportChannelPreview channel={helpChannel} key='channel-list-help' />
    )
  }

  render() {
    const { partnerId, chatClient, user, openDir } = this.props
    return (
      <Chat client={chatClient} theme='messaging light' initialNavOpen={false}>
        <ConversationBox partnerId={partnerId} user={user} openDir={openDir} />
      </Chat>
    )
  }
}

export default withChatContext(Conversations)
