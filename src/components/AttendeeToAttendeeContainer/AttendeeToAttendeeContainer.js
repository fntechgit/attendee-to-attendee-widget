import PropTypes from 'prop-types'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react'
import AccessRepository from '../../lib/repository/accessRepository'
import Alert from '../Alert/Alert'
import { AttendeeInfo } from '../AttendeeInfo/AttendeeInfo'
import AttendeesList from '../AttendeesList/AttendeesList'
import { AttendeesNewsProvider } from '../../lib/attendeesContext'
import ChatAPIService from '../../lib/services/chatAPIService'
import ChatRepository from '../../lib/repository/chatRepository'
import ConversationBox from '../Chat/ConversationBox/ConversationBox'
import DMChannelListContainer from '../Chat/ChannelListContainer/DMChannelListContainer'
import { MainBar } from '../MainBar/MainBar'
import { Tabs, ActiveTabContent } from '../Tabs/Tabs'
import StreamChatService from '../../lib/services/streamChatService'
import SupabaseClientBuilder from '../../lib/supabaseClientBuilder'
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

let accessRepo = null
let chatRepo = null
let chatCounterpart = roles.HELP
let activeChannel = null
let dlCallback = null
let chatClientEventsListener = null

const tabNames = {
  ATTENDEES: 'ATTENDEES',
  MESSAGES: 'DIRECT MESSAGES',
  ROOM_CHATS: 'GROUP CHATS'
}

const AttendeeToAttendeeContainer = forwardRef((props, ref) => {
  const [activeTab, setActiveTab] = useState(tabNames.ATTENDEES)
  const [isMinimized, setMinimized] = useState(false)
  const [chatOpened, setChatOpened] = useState(false)
  const [qaChatOpened, setQAChatOpened] = useState(false)
  const [chatClient, setChatClient] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [attCardItem, setAttCardItem] = useState(null)
  const [alertMessage, setAlertMessage] = useState(null)
  const [supportPanelSettings, setSupportPanelSettings] = useState({
    help: true,
    qa: false
  })
  const [showMsgNewsBadge, setShowMsgNewsBadge] = useState(false)

  let isCardHovered = false
  let isAttHovered = false

  const baseUrl = extractBaseUrl(window.location.href)

  const {
    supabaseUrl,
    supabaseKey,
    streamApiKey,
    apiBaseUrl,
    chatApiBaseUrl,
    user,
    summitId,
    openDir,
    activity,
    getAccessToken
  } = props
  props = { ...props, url: baseUrl }

  useEffect(() => {
    const init = async () => {
      if (!accessRepo) {
        accessRepo = new AccessRepository(
          SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
          true
        )
      }
      if (!chatRepo) {
        chatRepo = new ChatRepository(
          SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
          new StreamChatService(streamApiKey),
          new ChatAPIService()
        )
      }

      await chatRepo.initializeClient(
        user,
        accessRepo,
        chatApiBaseUrl,
        accessToken,
        summitId,
        (client) => {
          setChatClient(client)
          //if (activity) chatRepo.setUpActivityRoom(activity, user)

          chatClientEventsListener = client.on((event) => {
            //console.log('event', event)

            if (
              event.type === 'message.new' ||
              event.type === 'notification.message_new'
            ) {
              setShowMsgNewsBadge(event.total_unread_count > 0)
            }

            if (event.type === 'notification.mark_read') {
              setShowMsgNewsBadge(event.total_unread_count > 0)
            }
          })

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

      const enableHelpBtn = await chatRepo.availableHelpAgents(summitId)
      const enableQABtn =
        activity && (await chatRepo.availableQAAgents(summitId, activity.id))
      setSupportPanelSettings({ help: enableHelpBtn, qa: enableQABtn })
    }
    if (accessToken) {
      init()
    }
  }, [accessToken])

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token && token !== accessToken) setAccessToken(token)
    })
  })

  useEffect(() => {
    return () => {
      console.log('disconnecting chat...')
      chatClientEventsListener?.unsubscribe()
      chatRepo?.disconnect()
      accessRepo?.disconnect()
    }
  }, [])

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

  const handleChatMenuSelection = (index, channel, me) => {
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

  const closeAlert = () => {
    setAlertMessage(null)
  }

  const closeAttendeeCard = () => {
    isAttHovered = false
    setAttCardItem(null)
  }

  const showAutoClosingAlert = (message, closeTimeout) => {
    setAlertMessage(message)
    setTimeout(() => {
      closeAlert()
    }, closeTimeout)
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
    closeAttendeeCard()
    if (att.idp_user_id == user.idpUserId) return
    if (!att.public_profile_allow_chat_with_me) {
      console.log("this attendee doesn't have chat enabled")
      return
    }
    if (!user.hasPermission(permissions.CHAT)) {
      console.log('chat permission required')
      return
    }
    showChatWindow(chatClient, null, att.idp_user_id)
  }

  const handleAttendeePicTouch = (att) => {
    isAttHovered = true
    setAttCardItem(att)
  }

  const handleAttendeePicMouseEnter = (att) => {
    isAttHovered = true
    setAttCardItem(att)
  }

  const handleAttendeePicMouseLeave = () => {
    isAttHovered = false
    setTimeout(() => {
      if (!isCardHovered && !isAttHovered) setAttCardItem(null)
    }, 300)
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
      showNewsBadge: false,
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
          showHelpButton={supportPanelSettings.help}
          showQAButton={supportPanelSettings.qa}
        />
      )
    },
    {
      name: tabNames.MESSAGES,
      icon: '',
      showNewsBadge: showMsgNewsBadge,
      content: chatClient && chatClient.user && (
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
          showHelpButton={supportPanelSettings.help}
          showQAButton={supportPanelSettings.qa}
        />
      )
    },
    {
      name: tabNames.ROOM_CHATS,
      icon: '',
      showNewsBadge: false,
      content: chatClient && chatClient.user && (
        <RoomChannelListContainer
          user={user}
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
          showHelpButton={supportPanelSettings.help}
          showQAButton={supportPanelSettings.qa}
        />
      )
    }
  ]

  return (
    <ErrorBoundary
      FallbackComponent={ErrorBoundaryFallback}
      onError={ebHandleError}
    >
      <div className={style.widgetContainer}>
        <AttendeesNewsProvider>
          <MainBar
            user={user}
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
              {accessRepo && (
                <ActiveTabContent
                  key={activeTab}
                  content={activeTabContent()}
                />
              )}
            </div>
          )}
        </AttendeesNewsProvider>

        {chatClient && chatOpened && user && (
          <ConversationBox
            chatClient={chatClient}
            chatRepo={chatRepo}
            activeChannel={activeChannel}
            user={user}
            chatCounterpart={chatCounterpart}
            openDir={openDir}
            summitId={summitId}
            visible={chatOpened}
            activity={activity}
            onClose={() => setChatOpened(false)}
            onChatMenuSelected={handleChatMenuSelection}
            onChatStartError={(error) => showAutoClosingAlert(error, 3000)}
          />
        )}
        {chatClient && qaChatOpened && user && (
          <ConversationBox
            chatClient={chatClient}
            chatRepo={chatRepo}
            user={user}
            chatCounterpart={roles.QA}
            openDir={chatOpened && activeChannel ? 'parentLeft' : 'left'}
            summitId={summitId}
            activity={activity}
            visible={qaChatOpened}
            onClose={() => setQAChatOpened(false)}
            onChatStartError={(error) => showAutoClosingAlert(error, 3000)}
          />
        )}
        {attCardItem && (
          <AttendeeInfo
            user={attCardItem}
            fullMode={true}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            onChatClick={handleAttendeeClick}
            onTap={closeAttendeeCard}
          />
        )}
        {alertMessage && <Alert message={alertMessage} onClick={closeAlert} />}
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
