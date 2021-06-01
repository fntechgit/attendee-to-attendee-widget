import React, { useEffect, useState } from 'react'
import AccessRepository from '../../lib/repository/accessRepository'
import ChatRepository from '../../lib/repository/chatRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import ChatAPIService from '../../lib/services/chatAPIService'
import StreamChatService from '../../lib/services/streamChatService'
import SupabaseClientBuilder from '../../lib/supabaseClientBuilder'
import DMChannelListContainer from '../Chat/ChannelListContainer/DMChannelListContainer'
import RoomChannelListContainer from '../Chat/ChannelListContainer/RoomChannelListContainer'
import ConversationBox from '../Chat/ConversationBox/ConversationBox'
import { copyToClipboard } from '../../utils/clipboardHelper'
import { channelTypes } from '../../models/channelTypes'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'
import 'stream-chat-react/dist/css/index.css'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null
let chatCounterpart = channelTypes.HELP_ROOM
let activeChannel = null

const AttendeeToAttendeeContainer = (props) => {
  const [activeTab, setActiveTab] = useState('ATTENDEES')
  const [isMinimized, setMinimized] = useState(false)
  const [chatOpened, setChatOpened] = useState(false)
  const [qaChatOpened, setQAChatOpened] = useState(false)
  const [chatClient, setChatClient] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

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
    activity,
    getAccessToken
  } = props
  props = { ...props, url: window.location.href.split('?')[0] }

  if (!accessRepo) {
    accessRepo = new AccessRepository(
      SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey)
    )
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(
      SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
      new StreamChatService(streamApiKey),
      new ChatAPIService()
    )
  }

  useEffect(() => {
    const initChat = async () => {
      await chatRepo.initializeClient(
        user,
        accessRepo,
        apiBaseUrl,
        accessToken,
        forumSlug,
        (client) => {
          setChatClient(client)
          chatRepo.setUpActivityRoom(activity, user)
        },
        (err) => console.error(err),
        (err, res) => console.log(err, res)
      )

      //TODO: Uncomment
      // await chatRepo.seedChannelTypes(
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

    if (accessToken) {
      initChat()
      return () => cleanUpChat()
    }
  }, [accessToken])

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token && token !== accessToken) setAccessToken(token)
    })
  })

  const showChatWindow = (preloadedChannel, counterpart) => {
    if (chatClient) {
      if (chatOpened) setChatOpened(false)
      if (qaChatOpened) setQAChatOpened(false)
      activeChannel = preloadedChannel
      chatCounterpart = counterpart
      setTimeout(() => {
        setChatOpened(true)
      }, 100)
    }
  }

  const handleChatMenuSelection = (index, channel) => {
    switch (index) {
      case 1:
        chatRepo.removeMember(channel, me.id)
        break
      case 2:
        copyToClipboard(
          `${window.location.href.split('?')[0]}?gotoroom=${channel.id}`
        )
        break
      case 3:
        if (!qaChatOpened) {
          setTimeout(() => {
            setQAChatOpened(true)
          }, 100)
        }
        break
    }
  }

  const handleHelpClick = async () => {
    showChatWindow(null, channelTypes.HELP_ROOM)
  }

  const handleQAClick = (index, channel) => {
    if (!qaChatOpened) {
      setTimeout(() => {
        setQAChatOpened(true)
      }, 100)
    }
  }

  const handleAttendeeClick = (att) => {
    if (att.attendees.idp_user_id != user.idpUserId && user.canChat) {
      showChatWindow(null, att.attendees.idp_user_id)
    }
  }

  const handleMessageClick = (channel) => {
    if (user.canChat) {
      showChatWindow(channel, null)
    }
  }

  const changeActiveTab = (tab) => {
    setActiveTab(tab)
  }

  const activeTabContent = () => {
    const activeIndex = tabList.findIndex((tab) => tab.name === activeTab)
    return tabList[activeIndex].content
  }

  const tabList = [
    {
      name: 'ATTENDEES',
      icon: '',
      content: chatClient && (
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
      content: chatClient && (
        <DMChannelListContainer
          user={user}
          summitId={summitId}
          chatClient={chatClient}
          accessRepo={accessRepo}
          onItemClick={handleMessageClick}
          height={props.height}
          activity={activity}
          onHelpClick={handleHelpClick}
          onQAClick={handleQAClick}
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
          chatRepo={chatRepo}
          activeChannel={activeChannel}
          user={user}
          partnerId={chatCounterpart}
          openDir={openDir}
          summitId={summitId}
          visible={chatOpened}
          activity={activity}
          onClose={() => setChatOpened(false)}
          onChatMenuSelected={handleChatMenuSelection}
        />
      )}
      {chatClient && qaChatOpened && user && (
        <ConversationBox
          chatClient={chatClient}
          chatRepo={chatRepo}
          user={user}
          partnerId={channelTypes.QA_ROOM}
          openDir={chatOpened ? 'parentLeft' : 'left'}
          summitId={summitId}
          activity={activity}
          visible={qaChatOpened}
          onClose={() => setQAChatOpened(false)}
        />
      )}
    </div>
  )
}

export default AttendeeToAttendeeContainer
