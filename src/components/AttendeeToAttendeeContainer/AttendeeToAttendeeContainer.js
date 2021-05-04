import React, { useEffect, useState } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import StreamChatService from '../../lib/StreamChatService'
import ChannelListContainer from '../Chat/ChannelListContainer/ChannelListContainer'
import ConversationBox from '../Chat/ConversationBox/ConversationBox'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'
import 'stream-chat-react/dist/css/index.css'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null
let streamChatService = null
let chatCounterpart = 'help'

const AttendeeToAttendeeContainer = (props) => {
  const [activeTab, setActiveTab] = useState('ATTENDEES')
  const [isMinimized, setMinimized] = useState(false)
  const [chatOpened, setChatOpened] = useState(false)
  const [chatClient, setChatClient] = useState(null)

  const {
    supabaseUrl,
    supabaseKey,
    streamApiKey,
    apiBaseUrl,
    forumSlug,
    user,
    accessToken,
    summitId,
    openDir
  } = props
  props = { ...props, url: window.location.href.split('?')[0] }

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }

  if (!streamChatService) {
    streamChatService = new StreamChatService(streamApiKey)
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey, user)
  }

  useEffect(() => {
    const initChat = async () => {
      await streamChatService.initializeClient(
        apiBaseUrl,
        accessToken,
        forumSlug,
        (client) => {
          setChatClient(client)
        },
        (err, res) => console.log(err)
      )
    }

    const cleanUpChat = async () => {
      if (chatClient) await chatClient.disconnect()
    }

    if (accessToken) {
      initChat()
      return () => cleanUpChat()
    }
  }, [])

  const handleHelpClick = () => {
    if (chatClient) {
      if (chatOpened) setChatOpened(false)
      chatCounterpart = 'help'
      setTimeout(() => {
        setChatOpened(true)
      }, 100)
    }
  }

  const handleAttendeeClick = (att) => {
    if (chatClient) {
      if (chatOpened) setChatOpened(false)
      chatCounterpart = att.attendees.idp_user_id
      setTimeout(() => {
        setChatOpened(true)
      }, 100)
    }
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
        <ChannelListContainer
          user={user}
          chatClient={chatClient}
          height={props.height}
        />
      )
    },
    {
      name: 'ROOM CHATS',
      icon: '',
      content: ''
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
          user={user}
          partnerId={chatCounterpart}
          openDir={openDir}
          summitId={summitId}
          visible={chatOpened}
          onClose={() => setChatOpened(false)}
        />
      )}
    </div>
  )
}

export default AttendeeToAttendeeContainer
