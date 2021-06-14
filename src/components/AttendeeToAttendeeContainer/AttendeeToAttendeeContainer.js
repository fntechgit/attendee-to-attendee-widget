import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState
} from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import ChatAPIService from '../../lib/services/ChatAPIService'
import StreamChatService from '../../lib/services/StreamChatService'
import SupabaseClientBuilder from '../../lib/SupabaseClientBuilder'
import DMChannelListContainer from '../Chat/ChannelListContainer/DMChannelListContainer'
import RoomChannelListContainer from '../Chat/ChannelListContainer/RoomChannelListContainer'
import ConversationBox from '../Chat/ConversationBox/ConversationBox'
import { copyToClipboard } from '../../utils/clipboardHelper'
import { roles } from '../../models/userRoles'
import { permissions } from '../../models/permissions'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'
import 'stream-chat-react/dist/css/index.css'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null
let chatCounterpart = roles.HELP
let activeChannel = null
let dlCallback = null

const tabNames = {
  ATTENDEES: 'ATTENDEES',
  MESSAGES: 'MESSAGES',
  ROOM_CHATS: 'ROOM CHATS'
}

const AttendeeToAttendeeContainer = forwardRef((props, ref) => {
  const [currentUser, setCurrentUser] = useState(props.user)
  const [activeTab, setActiveTab] = useState(tabNames.ATTENDEES)
  const [isMinimized, setMinimized] = useState(false)
  const [chatOpened, setChatOpened] = useState(false)
  const [qaChatOpened, setQAChatOpened] = useState(false)
  const [chatClient, setChatClient] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  let baseUrl = window.location.href.split('?')[0]
  if (baseUrl) baseUrl = window.location.href.split('#')[0]

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
  props = { ...props, url: baseUrl }

  const initUser = async (currUser) => {
    const att = await accessRepo.findByIdpID(currUser.id)
    currUser.fullName = att.full_name
    currUser.email = att.email
    currUser.company = att.company
    currUser.title = att.title
    currUser.picUrl = att.pic_url
    currUser.bio = att.bio
    currUser.socialInfo = att.social_info
    currUser.badgeFeatures = att.badges_info
    setCurrentUser(currUser)
  }

  useEffect(() => {
    const init = async () => {
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
      await initUser(user)

      await chatRepo.initializeClient(
        user,
        accessRepo,
        apiBaseUrl,
        accessToken,
        forumSlug,
        (client) => {
          setChatClient(client)
          if (activity) chatRepo.setUpActivityRoom(activity, user)
          if (dlCallback) dlCallback(client)
        },
        (err) => console.error(err),
        (err, res) => console.log(err, res)
      )

      await chatRepo.seedChannelTypes(
        chatApiBaseUrl,
        summitId,
        accessToken,
        (res) => console.log(res),
        (err, res) => console.log(err)
      )
    }

    const cleanUpChat = async () => {
      if (chatClient) await chatClient.disconnect()
    }

    if (accessToken) {
      init()
    }
    return () => cleanUpChat()
  }, [accessToken])

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token && token !== accessToken) setAccessToken(token)
    })
  })

  const showChatWindow = (client, preloadedChannel, counterpart) => {
    console.log('showChatWindow')
    if (client) {
      console.log('showChatWindow chatClient', chatClient)
      if (chatOpened) setChatOpened(false)
      if (qaChatOpened) setQAChatOpened(false)
      activeChannel = preloadedChannel
      chatCounterpart = counterpart
      console.log('showChatWindow preloadedChannel', preloadedChannel)
      console.log('showChatWindow counterpart', counterpart)
      setTimeout(() => {
        console.log('showChatWindow setChatOpened')
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
        let baseUrl = window.location.href.split('?')[0]
        baseUrl = baseUrl.split('#')[0]
        copyToClipboard(`${baseUrl}#openchatroom=${channel.id}`)
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
    showChatWindow(chatClient, null, roles.HELP)
  }

  const handleQAClick = () => {
    if (!qaChatOpened) {
      setTimeout(() => {
        setQAChatOpened(true)
      }, 100)
    }
  }

  const handleAttendeeClick = (att) => {
    if (
      att.attendees.idp_user_id != user.idpUserId &&
      user.hasPermission(permissions.CHAT)
    ) {
      showChatWindow(chatClient, null, att.attendees.idp_user_id)
    }
  }

  const handleMessageClick = (channel) => {
    if (user.hasPermission(permissions.CHAT)) {
      showChatWindow(chatClient, channel, null)
    }
  }

  const changeActiveTab = (tab) => {
    setActiveTab(tab)
  }

  const activeTabContent = () => {
    const activeIndex = tabList.findIndex((tab) => tab.name === activeTab)
    return tabList[activeIndex].content
  }

  /*begin deep linking section*/
  useImperativeHandle(ref.sdcRef, () => ({
    startDirectChat(partnerId) {
      dlCallback = (client) => {
        if (
          partnerId != user.idpUserId &&
          user.hasPermission(permissions.CHAT)
        ) {
          changeActiveTab(tabNames.MESSAGES)
          showChatWindow(client, null, partnerId)
        }
      }
      if (chatClient) dlCallback(chatClient)
    }
  }))

  useImperativeHandle(ref.shcRef, () => ({
    startHelpChat() {
      dlCallback = (client) => {
        changeActiveTab(tabNames.MESSAGES)
        showChatWindow(client, null, roles.HELP)
      }
      if (chatClient) dlCallback(chatClient)
    }
  }))

  useImperativeHandle(ref.sqacRef, () => ({
    startQAChat() {
      dlCallback = (client) => {
        changeActiveTab(tabNames.MESSAGES)
        showChatWindow(client, null, roles.QA)
      }
      if (chatClient) dlCallback(chatClient)
    }
  }))

  useImperativeHandle(ref.ocrRef, () => ({
    openChatRoom(roomId) {
      dlCallback = async (client) => {
        changeActiveTab(tabNames.ROOM_CHATS)
        console.log('openChatRoom roomId', roomId)
        const channel = await chatRepo.getChannel(roomId)
        console.log('openChatRoom channel', channel)
        showChatWindow(client, channel, null)
      }
      if (chatClient) dlCallback(chatClient)
    }
  }))
  /*end deep linking section*/

  const tabList = [
    {
      name: tabNames.ATTENDEES,
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
      name: tabNames.MESSAGES,
      icon: '',
      content: chatClient && (
        <DMChannelListContainer
          user={currentUser}
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
      name: tabNames.ROOM_CHATS,
      icon: '',
      content: (
        <RoomChannelListContainer
          user={currentUser}
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
        user={currentUser}
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
      {chatClient && chatOpened && currentUser && (
        <ConversationBox
          chatClient={chatClient}
          chatRepo={chatRepo}
          activeChannel={activeChannel}
          user={currentUser}
          chatCounterpart={chatCounterpart}
          openDir={openDir}
          summitId={summitId}
          visible={chatOpened}
          activity={activity}
          onClose={() => setChatOpened(false)}
          onChatMenuSelected={handleChatMenuSelection}
        />
      )}
      {chatClient && qaChatOpened && currentUser && (
        <ConversationBox
          chatClient={chatClient}
          chatRepo={chatRepo}
          user={currentUser}
          chatCounterpart={roles.QA}
          openDir={chatOpened && activeChannel ? 'parentLeft' : 'left'}
          summitId={summitId}
          activity={activity}
          visible={qaChatOpened}
          onClose={() => setQAChatOpened(false)}
        />
      )}
    </div>
  )
})

export default AttendeeToAttendeeContainer
