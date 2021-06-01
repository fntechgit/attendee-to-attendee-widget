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
import SimpleChannelHeader from '../CustomChannelHeader/SimpleChannelHeader'
import CustomRoomChannelHeader from '../CustomChannelHeader/CustomRoomChannelHeader'
import { channelTypes } from '../../../models/channelTypes'

import style from './style.module.scss'

const ConversationBox = ({
  partnerId,
  chatClient,
  chatRepo,
  activeChannel,
  user,
  openDir,
  setActiveChannel,
  onClose,
  visible,
  summitId,
  activity,
  onChatMenuSelected
}) => {
  const [channel, setChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initChannel = async () => {
      //console.log('activeChannel', activeChannel)
      if (!activeChannel) {
        if (partnerId === channelTypes.QA_ROOM) {
          if (!activity) return
          const qaChannel = await chatRepo.startQAChat(user, summitId, activity)
          if (qaChannel) setChannel(qaChannel)
        } else if (partnerId === channelTypes.HELP_ROOM) {
          const helpChannel = await chatRepo.startHelpChat(user, summitId)
          if (helpChannel) setChannel(helpChannel)
        } else {
          const dmChannel = await chatRepo.startA2AChat(user, partnerId)
          if (dmChannel) setChannel(dmChannel)
        }
      } else {
        setChannel(activeChannel)
      }
      setIsLoading(false)
    }
    //console.log('initChannel', visible)
    if (visible) initChannel()
  }, [partnerId, visible])

  const handleClose = (ev) => {
    ev.preventDefault()
    setActiveChannel(null)
    setChannel(null)
    setIsLoading(false)
    onClose()
  }

  const buildChannelHeader = () => {
    const channelType = activeChannel ? activeChannel.type : partnerId

    if (
      channelType === channelTypes.QA_ROOM ||
      channelType === channelTypes.HELP_ROOM ||
      channelType === channelTypes.MESSAGING
    ) {
      return (
        <SimpleChannelHeader
          me={chatClient.user}
          channel={channel}
          onClose={handleClose}
        />
      )
    }
    return (
      <CustomRoomChannelHeader
        me={chatClient.user}
        channel={channel}
        onClose={handleClose}
        onMenuSelected={onChatMenuSelected}
      />
    )
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
              {buildChannelHeader()}
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
