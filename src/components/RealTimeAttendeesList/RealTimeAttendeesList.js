import React, { useEffect, useState } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import StreamChatService from '../../lib/StreamChatService'
import MessagesList from '../Chat/MessagesList'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null
let streamChatService = null

const RealTimeAttendeesList = (props) => {
  const [activeTab, setActiveTab] = useState('ATTENDEES')
  const [isMinimized, setMinimized] = useState(false)
  const [chatClient, setChatClient] = useState(null);

  const { supabaseUrl, supabaseKey, streamApiKey, apiBaseUrl, forumSlug, user, accessToken } = props
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
        (client) => {setChatClient(client)},
        (err, res) => console.log(err)
      )
    }

    if (accessToken) {
      initChat();
    }
  }, []);

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
        />
      )
    },
    {
      name: 'MESSAGES',
      icon: '',
      content: <MessagesList user={user} chatClient={chatClient} />
    },
    {
      name: 'ROOM CHATS',
      icon: '',
      content: ''
    }
  ]

  return (
    <div className={style.widgetContainer}>
      <MainBar user={user} onMinimizeButtonClick={() => setMinimized(!isMinimized)} />
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
    </div>
  )
}

export default RealTimeAttendeesList
