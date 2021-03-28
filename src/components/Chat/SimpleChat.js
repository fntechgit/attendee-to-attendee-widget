import React, { Component } from 'react'
import StreamChatService from '../../lib/StreamChatService'
import ChatRepository from '../../lib/repository/ChatRepository'
import Conversations from './Conversations'
import style from './style.module.scss'

class SimpleChat extends Component {
  static defaultProps = {
    openDir: 'left',
    title: '',
    hideUsers: false,
    showHelp: false,
    showQA: false
  }

  constructor(props) {
    super(props)

    this.state = {
      chatClient: null,
      chatClientConnected: false,
      user: null
    }
    this._currPartnerId = null
    this._chatRepo =  new ChatRepository(props.supabaseUrl, props.supabaseKey)
    this._streamChatService = new StreamChatService(props.streamApiKey)
  }

  componentDidMount = () => {
    window.addEventListener('beforeunload', this.chatCleanup)
  }

  componentWillUnmount() {
    this.chatCleanup()
    window.removeEventListener('beforeunload', this.chatCleanup)
  }

  chatCleanup = async () => {
    const { chatClient } = this.state
    if (chatClient) await chatClient.disconnect()
    this.setState({ chatClient: null, chatClientConnected: false, user: null })
  }

  initCallback = (chatClient, user) => {
    if (user) {
      this.setState({ chatClient, chatClientConnected: true, user })
    }
  }

  startOneToOneChat = async (partnerId) => {
    const {
      accessToken,
      streamApiKey,
      apiBaseUrl,
      forumSlug,
      onAuthError,
      summitId,
      user
    } = this.props

    // this._currPartnerId = partnerId

    // if (accessToken) {
    //   const { chatClient } = this.state
    //   if (chatClient) {
    //     await chatClient.disconnect()
    //     this.state = this.setState({
    //       ...this.state,
    //       chatClientConnected: false
    //     })
    //   }
    //   await this._streamChatService.initialiseClient(
    //     streamApiKey,
    //     apiBaseUrl,
    //     accessToken,
    //     forumSlug,
    //     this.initCallback,
    //     onAuthError
    //   )
    // }

    this._chatRepo.notifyNewMessage(user, partnerId, summitId, 'Test message')
  }

  render() {
    const { chatClient, chatClientConnected, user } = this.state
    const { openDir, hideUsers, showHelp, showQA } = this.props

    return (
      <div className={style.widgetWrapper}>
        {chatClient && chatClientConnected && user && (
          <div className={style.sideBar}>
            <Conversations
              chatClient={chatClient}
              user={user}
              partnerId={this._currPartnerId}
              openDir={openDir}
              hideUsers={hideUsers}
              showHelp={showHelp}
              showQA={showQA}
            />
          </div>
        )}
      </div>
    )
  }
}

export default SimpleChat
