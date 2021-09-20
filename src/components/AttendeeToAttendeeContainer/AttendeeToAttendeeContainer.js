import PropTypes from 'prop-types'
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState
} from 'react'
import AccessRepository from '../../lib/repository/accessRepository'
import AttendeesList from '../AttendeesList/AttendeesList'
import ChatAPIService from '../../lib/services/ChatAPIService'
import ChatRepository from '../../lib/repository/chatRepository'
import ConversationBox from '../Chat/ConversationBox/ConversationBox'
import DMChannelListContainer from '../Chat/ChannelListContainer/DMChannelListContainer'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import StreamChatService from '../../lib/services/streamChatService'
import SupabaseClientBuilder from '../../lib/SupabaseClientBuilder'
import RoomChannelListContainer from '../Chat/ChannelListContainer/RoomChannelListContainer'
import { copyToClipboard } from '../../utils/clipboardHelper'
import { roles } from '../../models/userRoles'
import { permissions } from '../../models/permissions'
import { extractBaseUrl } from '../../utils/urlHelper'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '../ErrorBoundaryFallback/ErrorBoundaryFallback'

import 'font-awesome/css/font-awesome.min.css'
import 'bulma/css/bulma.css'
import 'stream-chat-react/dist/css/index.css'

import style from './style.module.scss'
import { AttendeeInfo } from '../AttendeeInfo/AttendeeInfo'

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
  const [attCardItem, setAttCardItem] = useState(null)
  let isCardHovered = false

  const baseUrl = extractBaseUrl(window.location.href)

  const pendingOps = new Set()

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
    if (att) {
      currUser.fullName = att.full_name
      currUser.email = att.email
      currUser.company = att.company
      currUser.title = att.title
      currUser.picUrl = att.pic_url
      currUser.bio = att.bio
      currUser.socialInfo = att.social_info
      currUser.badgeFeatures = att.badges_info
      setCurrentUser(currUser)
    } else {
      console.warn(`Could not find a user with id ${currUser.id}`)
    }
  }

  const disconnectChat = () => {
    console.log('disconnecting chat...')
    chatRepo.disconnect()
  }
  
  const addToPendingWork = (promise) => {
    pendingOps.add(promise)
    const cleanup = () => pendingOps.delete(promise)
    promise.then(cleanup).catch(cleanup)
  }

  const onBeforeUnload = (e) => {
    addToPendingWork(disconnectChat())
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
        chatApiBaseUrl,
        accessToken,
        summitId,
        (client) => {
          setChatClient(client)
          if (activity) chatRepo.setUpActivityRoom(activity, user)
          if (dlCallback) {
            dlCallback(client)
            dlCallback = null
          }
        },
        (err) => console.error(err),
        (err, res) => console.log(err, res)
      )

      await chatRepo.seedChannelTypes(
        chatApiBaseUrl,
        summitId,
        accessToken,
        (res) => {},
        (err, res) => {}
      )
    }
    if (accessToken) {
      init()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onBeforeUnload)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
    }
  }, [accessToken])

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token && token !== accessToken) setAccessToken(token)
    })
  })

  const showChatWindow = (client, preloadedChannel, counterpart) => {
    if (client) {
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
      att.idp_user_id != user.idpUserId &&
      user.hasPermission(permissions.CHAT)
    ) {
      showChatWindow(chatClient, null, att.idp_user_id)
    }
  }

  const handleAttendeePicTouch = (att) => {
    setAttCardItem(att)
  }

  const handleAttendeePicMouseEnter = (att) => {
    setAttCardItem(att)
  }

  const handleAttendeePicMouseLeave = () => {
    setTimeout(() => {
      if (!isCardHovered) setAttCardItem(null)
    }, 100)
  }

  const handleCardMouseEnter = () => {
    isCardHovered = true
  }

  const handleCardMouseLeave = () => {
    isCardHovered = false
    setAttCardItem(null)
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
        const channel = await chatRepo.getChannel(roomId)
        showChatWindow(client, channel, null)
      }
      if (chatClient) dlCallback(chatClient)
    }
  }))
  /*end deep linking section*/

  const ebHandleError = (error, info) => {
    console.log('Something went wrong with the A2A component', error, info)
  }

  const tabList = [
    {
      name: tabNames.ATTENDEES,
      icon: '',
      content: chatClient && (
        <AttendeesList
          {...props}
          accessRepo={accessRepo}
          chatRepo={chatRepo}
          activity={activity}
          onItemClick={handleAttendeeClick}
          onItemPicTouch={handleAttendeePicTouch}
          onItemPicMouseEnter={handleAttendeePicMouseEnter}
          onItemPicMouseLeave={handleAttendeePicMouseLeave}
          onHelpClick={handleHelpClick}
          onQAClick={handleQAClick}
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
          activity={activity}
          onItemClick={handleMessageClick}
          onHelpClick={handleHelpClick}
          onQAClick={handleQAClick}
          height={props.height}
          openDir={props.openDir}
        />
      )
    }
  ]

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onError={ebHandleError}>
      <div className={style.widgetContainer}>
        <MainBar
          user={currentUser}
          onHelpClick={handleHelpClick}
          onMinimizeButtonClick={() => setMinimized(!isMinimized)}
        />
        {!isMinimized && (
          <div className='mt-2'>
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
        {attCardItem && (
          <AttendeeInfo
            user={attCardItem}
            fullMode={true}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            onChatClick={handleAttendeeClick}
          />
        )}
      </div>
    </ErrorBoundary>
  )
})

AttendeeToAttendeeContainer.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
}

export default AttendeeToAttendeeContainer
