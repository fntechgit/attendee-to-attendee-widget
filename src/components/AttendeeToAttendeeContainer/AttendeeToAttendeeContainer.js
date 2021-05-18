import React, { useEffect, useState } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import StreamChatService from '../../lib/services/StreamChatService'
import DMChannelListContainer from '../Chat/ChannelListContainer/DMChannelListContainer'
import RoomChannelListContainer from '../Chat/ChannelListContainer/RoomChannelListContainer'
import ConversationBox from '../Chat/ConversationBox/ConversationBox'
import { channelTypes } from '../../models/channel_types'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'
import 'stream-chat-react/dist/css/index.css'

import style from './style.module.scss'
import ChatAPIService from '../../lib/services/ChatAPIService'

let accessRepo = null
let chatRepo = null
let streamChatService = null
let chatAPIService = null
let chatCounterpart = channelTypes.HELP_ROOM
let activeChannel = null

const AttendeeToAttendeeContainer = (props) => {
  const [activeTab, setActiveTab] = useState('ATTENDEES')
  const [isMinimized, setMinimized] = useState(false)
  const [chatOpened, setChatOpened] = useState(false)
  const [qaChatOpened, setQAChatOpened] = useState(false)
  const [chatClient, setChatClient] = useState(null)

  const {
    supabaseUrl,
    supabaseKey,
    streamApiKey,
    apiBaseUrl,
    chatApiBaseUrl,
    forumSlug,
    user,
    summitId,
    openDir,
    getAccessToken
  } = props
  props = { ...props, url: window.location.href.split('?')[0] }

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }

  if (!streamChatService) {
    streamChatService = new StreamChatService(streamApiKey)
  }

  if (!chatAPIService) {
    chatAPIService = new ChatAPIService()
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey, user)
  }

  useEffect(() => {
    const initChat = async () => {
      const accessToken = await getAccessToken()
      await streamChatService.initializeClient(
        apiBaseUrl,
        accessToken,
        forumSlug,
        (client) => {
          setChatClient(client)
        },
        (err, res) => console.log(err)
      )

      // await chatAPIService.seedChannelTypes(
      //   chatApiBaseUrl,
      //   summitId,
      //   accessToken,
      //   (res) => console.log(res),
      //   (err, res) => console.log(err)
      // )
    }

    const cleanUpChat = async () => {
      if (chatClient) await chatClient.disconnect()
    }

    initChat()
    return () => cleanUpChat()
  }, [])

  const showChatWindow = (preloadedChannel, counterpart) => {
    if (chatClient) {
      if (chatOpened) setChatOpened(false)
      activeChannel = preloadedChannel
      chatCounterpart = counterpart
      setTimeout(() => {
        setChatOpened(true)
      }, 100)
    }
  }

  const handleHelpClick = async () => {
    showChatWindow(null, channelTypes.HELP_ROOM)
  }

  const handleChatMenuSelection = (index) => {
    switch (index) {
      case 1:
        StreamChatService.removeMember(channel, me.id)
        break
      case 2:
        console.log('INVITE LINK')
        break
      case 3:
        console.log('QA')
        break
    }
  }

  const handleAttendeeClick = (att) => {
    if (att.attendees.idp_user_id != user.idpUserId) {
      showChatWindow(null, att.attendees.idp_user_id)
    }
  }

  const handleMessageClick = (channel) => {
    showChatWindow(channel, null)
  }

  const changeActiveTab = (tab) => {
    setActiveTab(tab)
  }

  const activeTabContent = () => {
    const activeIndex = tabList.findIndex((tab) => {
      return tab.name === activeTab
    })

    return tabList[activeIndex].content
  }

  const tabList = [
    {
      name: 'ATTENDEES',
      icon: '',
      content: (
        <AttendeesList
          {...props}
          accessRepo={accessRepo}
          chatRepo={chatRepo}
          onItemClick={handleAttendeeClick}
        />
      )
    },
    {
      name: 'MESSAGES',
      icon: '',
      content: (
        <DMChannelListContainer
          user={user}
          summitId={summitId}
          chatClient={chatClient}
          accessRepo={accessRepo}
          onItemClick={handleMessageClick}
          height={props.height}
        />
      )
    },
    {
      name: 'ROOM CHATS',
      icon: '',
      content: (
        <RoomChannelListContainer
          user={user}
          summitId={summitId}
          chatClient={chatClient}
          accessRepo={accessRepo}
          chatRepo={chatRepo}
          onItemClick={handleMessageClick}
          height={props.height}
          openDir={props.openDir}
        />
      )
    }
  ]

  return (
    <div className={style.widgetContainer}>
      <MainBar
        user={user}
        onHelpClick={handleHelpClick}
        onMinimizeButtonClick={() => setMinimized(!isMinimized)}
      />
      {!isMinimized && (
        <div>
          <Tabs
            tabList={tabList}
            activeTab={activeTab}
            changeActiveTab={changeActiveTab}
          />
          <ActiveTabContent key={activeTab} content={activeTabContent()} />
        </div>
      )}
      {chatClient && chatOpened && user && (
        <ConversationBox
          chatClient={chatClient}
          activeChannel={activeChannel}
          user={user}
          partnerId={chatCounterpart}
          openDir={openDir}
          summitId={summitId}
          visible={chatOpened}
          onClose={() => setChatOpened(false)}
          onChatMenuSelected={handleChatMenuSelection}
        />
      )}
    </div>
  )
}

export default AttendeeToAttendeeContainer
