import React, { useRef, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import {
  AttendeeToAttendeeContainer,
  permissions,
  Tracker
} from 'attendee-to-attendee-widget'

import 'attendee-to-attendee-widget/dist/index.css'

function findGetParameter(parameterName) {
  var result = null,
    tmp = []
  window.location.search
    .substr(1)
    .split('&')
    .forEach(function (item) {
      tmp = item.split('=')
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1])
    })
  return result
}

const accessToken = findGetParameter('accessToken')
const fullName = findGetParameter('fullName')
const email = findGetParameter('email')
const idpUserId = findGetParameter('idpUserId')

const sbAuthProps = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_KEY
}

const chatProps = {
  streamApiKey: '29gtgpyz5hht',
  apiBaseUrl: 'https://idp.dev.fnopen.com',
  chatApiBaseUrl: 'https://chat-api.dev.fnopen.com',
  forumSlug: 'fnvirtual-poc',
  getAccessToken: async () => accessToken,
  onAuthError: (err, res) => console.log(err),
  openDir: 'left',
  activity: {
    id: 206,
    name:
      'Global Collaboration Driving Innovation in a Multi-Billion Dollar Market',
    imgUrl: 'https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83'
  }
}

const widgetProps = {
  user: {
    id: null,
    fullName: '',
    email: '',
    company: '',
    title: '',
    picUrl: 'https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83',
    socialInfo: {
      githubUser: 'romanetar',
      linkedInProfile:
        'https://www.linkedin.com/in/rom%C3%A1n-gutierrez-pmp-7a001b6/',
      twitterName: 'romanetar',
      wechatUser: ''
    },
    badgeFeatures: null,
    bio: '# This is my bio, *in MD*!', //bio: '<p><span>This is my bio in HTML</span></p>'
    hasPermission: (permission) => {
      switch (permission) {
        case permissions.MANAGE_ROOMS:
          //return user.groups && (user.groups.includes('admins') || user.groups.includes('super-admins'))
          return true
        case permissions.CHAT:
          return true //based on badge features
        default:
          return false
      }
    }
  },
  summitId: 17,
  height: 400,
  ...chatProps,
  ...sbAuthProps
}

const App = () => {
  const trackerRef = useRef()
  const sdcRef = useRef()
  const shcRef = useRef()
  const sqacRef = useRef()
  const ocrRef = useRef()

  // const rnd = Math.floor(Math.random() * 5) + 1
  // widgetProps.user.fullName = `Test User ${rnd}`
  // widgetProps.user.email = `test${rnd}@nomail.com`
  // widgetProps.user.company = `Company ${rnd}`
  // widgetProps.user.title = `Title ${rnd}`
  // widgetProps.user.idpUserId = 13

  widgetProps.user.fullName = fullName
  widgetProps.user.email = email
  widgetProps.user.company = `Tipit`
  widgetProps.user.title = `Full stack developer`
  widgetProps.user.id = idpUserId
  widgetProps.user.idpUserId = idpUserId
  widgetProps.user.badgeFeatures = [
    {
      title: 'feat 1',
      imgUrl:
        'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
    },
    {
      title: 'feat 2',
      imgUrl:
        'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
    }
  ] //attendee.ticket.badge.features

  // const handleItemClick = (itemInfo) => {
  //   //setAccessInfo(itemInfo)
  //   //openModal()
  //   //console.log(itemInfo)
  //   if (itemInfo.attendees.idp_user_id != widgetProps.user.idpUserId) {
  //     startOneToOneChat(itemInfo.attendees.idp_user_id)
  //   }
  // }

  //From INVITE LINK
  const openChatRoom = (roomId) => {
    ocrRef.current.openChatRoom(roomId)
  }

  const startHelpChat = () => {
    shcRef.current.startHelpChat()
  }

  const startQAChat = () => {
    sqacRef.current.startQAChat()
  }

  const startDirectChat = (partnerId) => {
    sdcRef.current.startDirectChat(partnerId)
  }

  // const handleSignOutClick = () => {
  //   trackerRef.current.signOut()
  // }

  const token1 =
    'Saz.PStcv54NCAuJ0yhKUS1oI60Mz0_IjOZlK8Phr.EGsb6_HkJTaySqnthpSNwKZ2f9kxjgS6TIP3hL6ixv~dXv7pXyKsrNnmWiwWNxTzO9g4pG6PB.9458CFoNpKbj'
  const token2 =
    'WR6rbt1vPpmcYuv9Np.-8WNxbpSq8bjWODcXKrUGvw-TAbx-oQV1Psk3k~wElhBJvjOlKPBQWLmCTlPJgms-fho1TaTdb4uYi4bURTCV~CHmaElYgKyXyVUMJvrNMvps'
  const token3 =
    'Saz.PStcv54NCAuJ0yhKUS1oI60Mz0_IjOZlK8Phr.EGsb6_HkJTaySqnthpSNwKZ2f9kxjgS6TIP3hL6ixv~dXv7pXyKsrNnmWiwWNxTzO9g4pG6PB.9458CFoNpKbj'

  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <div>
            <Link
              to={`/attendance?accessToken=${token1}&fullName=Johnny Nimbus(Help)&email=cespin+1@gmail.com&idpUserId=6`}
            >
              Help User
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Roman Gutierrez&email=roman.gutierrez@gmail.com&idpUserId=13`}
            >
              Attendees
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token3}&fullName=Jethro Stratus (Q&A)&email=cespin+2@gmail.com&idpUserId=7`}
            >
              QA User
            </Link>
            <Tracker {...widgetProps} />
          </div>
        </Route>
        <Route path='/attendance'>
          <div
            style={{
              width: '400px',
              margin: '20px auto',
              position: 'relative'
            }}
          >
            <AttendeeToAttendeeContainer
              {...widgetProps}
              ref={{ sdcRef, shcRef, sqacRef, ocrRef }}
            />
            <Tracker {...widgetProps} ref={trackerRef} />
            <br />
            <hr />
            {/* <button onClick={handleSignOutClick}>SignOut</button> */}
            <button onClick={() => startDirectChat('7')}>
              Start Direct Chat
            </button>
            <button onClick={() => openChatRoom('578133244')}>
              Open Chat Room
            </button>
            <button onClick={startHelpChat}>Start Help Chat</button>
            <button onClick={startQAChat}>Start Q&A Chat</button>
          </div>
        </Route>
        <Route exact path='/untracked'>
          <div>Untracked page</div>
        </Route>
      </Switch>
    </Router>
  )
}

export default App
