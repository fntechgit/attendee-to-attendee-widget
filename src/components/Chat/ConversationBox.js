/* eslint-disable react/jsx-boolean-value */
import React, { useEffect, useState } from 'react'
import style from './style.module.scss'
import {
  Channel,
  LoadingIndicator,
  MessageInput,
  MessageList,
  Thread,
  Window,
  withChatContext
} from 'stream-chat-react'
import CustomChannelHeader from './CustomChannelHeader'
import ChatChannelsBuilder from '../../lib/ChatChannelsBuilder'

const ConversationBox = ({
  partnerId,
  client,
  user,
  openDir,
  setActiveChannel
}) => {
  const [channel, setChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getChannel = async () => {
      const res = await ChatChannelsBuilder.getChannel(partnerId, client, user)
      setChannel(res)
      setIsLoading(false)
    }
    setIsLoading(true)
    getChannel()
  }, [partnerId])

  const handleClose = (ev) => {
    ev.preventDefault()
    setActiveChannel(null)
    setChannel(null)
    setIsLoading(false)
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
        <Channel channel={channel}>
          <Window hideOnThread={true}>
            <CustomChannelHeader
              me={client.user}
              channel={channel}
              onClose={handleClose}
            />
            <MessageList client={client} closeThread={console.log} />
            <MessageInput focus />
          </Window>
          <Thread fullWidth />
        </Channel>
      </div>
    )
  )
}

export default withChatContext(ConversationBox)
