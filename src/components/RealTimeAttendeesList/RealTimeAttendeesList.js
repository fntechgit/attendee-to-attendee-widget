import React, { useState } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null

const RealTimeAttendeesList = (props) => {
  const [activeTab, setActiveTab] = useState('ATTENDEES')
  const [isMinimized, setMinimized] = useState(false)

  const { supabaseUrl, supabaseKey, user } = props
  props = { ...props, url: window.location.href.split('?')[0] }

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey, user)
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
        />
      )
    },
    {
      name: 'MESSAGES',
      icon: '',
      content: ''
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
