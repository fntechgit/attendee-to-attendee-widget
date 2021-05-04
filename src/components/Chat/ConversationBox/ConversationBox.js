/* eslint-disable react/jsx-boolean-value */
import React, { useEffect, useState } from 'react'
import {
  Channel,
  Chat,
  LoadingIndicator,
  MessageInput,
  MessageList,
  Thread,
  Window,
  withChatContext
} from 'stream-chat-react'
import CustomChannelHeader from '../CustomChannelHeader/CustomChannelHeader'
import ChatChannelsBuilder from '../../../lib/builders/ChatChannelsBuilder'

import style from './style.module.scss'

const ConversationBox = ({
  partnerId,
  chatClient,
  user,
  openDir,
  setActiveChannel,
  onClose,
  visible
}) => {
  const [channel, setChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initChannel = async () => {
      if (partnerId === 'qa') {
        // create QA channel between this user and qa users
        const qaChannel = await ChatChannelsBuilder.createSupportChannel(
          chatClient,
          user,
          'qa'
        )
        setChannel(qaChannel)
      } else if (partnerId === 'help') {
        // create Help channel between this user and help user
        const helpChannel = await ChatChannelsBuilder.createSupportChannel(
          chatClient,
          user,
          'help'
        )
        setChannel(helpChannel)
      } else {
        const res = await ChatChannelsBuilder.getChannel(
          partnerId,
          chatClient,
          user
        )
        setChannel(res)
      }
      setIsLoading(false)
    }
    console.log('initChannel', visible)
    if (visible) initChannel()
  }, [partnerId, visible])

  const handleClose = (ev) => {
    ev.preventDefault()
    setActiveChannel(null)
    setChannel(null)
    setIsLoading(false)
    onClose()
  }

  if (isLoading) {
    return (
      <div className={`${style.conversation} ${style[openDir]}`}>
        <LoadingIndicator size={35} />
      </div>
    )
  }

  return (
    channel && (
      <div className={`${style.conversation} ${style[openDir]}`}>
        <Chat client={chatClient} theme='messaging light' initialNavOpen={false}>
          <Channel channel={channel}>
            <Window hideOnThread={true}>
              <CustomChannelHeader
                me={chatClient.user}
                channel={channel}
                onClose={handleClose}
              />
              <MessageList client={chatClient} closeThread={console.log} />
              <MessageInput focus />
            </Window>
            <Thread fullWidth />
          </Channel>
        </Chat>
      </div>
    )
  )
}

export default withChatContext(ConversationBox)
