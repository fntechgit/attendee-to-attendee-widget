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
import StreamChatService from '../../../lib/services/StreamChatService'
import { channelTypes } from '../../../models/channel_types'

import style from './style.module.scss'

const ConversationBox = ({
  partnerId,
  chatClient,
  activeChannel,
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
      console.log('activeChannel', activeChannel)
      if (!activeChannel) {
        if (partnerId === 'qa') {
          // create QA channel between this user and qa users
          const qaChannel = await StreamChatService.createSupportChannel(
            chatClient,
            user,
            channelTypes.QA_ROOM
          )
          setChannel(qaChannel)
        } else if (partnerId === 'help') {
          // create Help channel between this user and help user
          const helpChannel = await StreamChatService.createSupportChannel(
            chatClient,
            user,
            channelTypes.HELP_ROOM
          )
          setChannel(helpChannel)
        } else {
          const res = await StreamChatService.getChannel(
            chatClient,
            channelTypes.MESSAGING,
            user,
            partnerId
          )
          setChannel(res)
        }
      } else {
        setChannel(activeChannel)
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
        <Chat
          client={chatClient}
          theme='messaging light'
          initialNavOpen={false}
        >
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
