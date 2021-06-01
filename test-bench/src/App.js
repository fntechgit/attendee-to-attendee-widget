import React, { useRef, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import {
  AttendeeToAttendeeContainer,
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
  title: '',
  showHelp: true,
  showQA: true,
  hideUsers: false,
  activity: {
    id: 206,
    name:
      'Global Collaboration Driving Innovation in a Multi-Billion Dollar Market', //Widget will create this activity room or add members to it
    imgUrl: 'https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83'
  }
}

const widgetProps = {
  user: {
    id: null,
    fullName: '',
    email: '',
    groups: ['admins'],
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
    badgeFeatures: ['feat 1', 'feat 2'], //attendee.ticket.badge.features
    bio: '# This is my bio, *in MD*!', //bio: '<p><span>This is my bio in HTML</span></p>'
    canChat: true //based on badge features
  },
  summitId: 17,
  height: 500,
  ...chatProps,
  ...sbAuthProps
}

const App = () => {
  const trackerRef = useRef()
  const chatRef = useRef()

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

  // const handleItemClick = (itemInfo) => {
  //   //setAccessInfo(itemInfo)
  //   //openModal()
  //   //console.log(itemInfo)
  //   if (itemInfo.attendees.idp_user_id != widgetProps.user.idpUserId) {
  //     startOneToOneChat(itemInfo.attendees.idp_user_id)
  //   }
  // }

  //From INVITE LINK
  const openChatRoom = (roomId) => {}

  const startOneToOneChat = (partnerId) => {
    chatRef.current.startOneToOneChat(partnerId)
  }

  const handleSignOutClick = () => {
    trackerRef.current.signOut()
  }

  const token1 =
    'pzPBcaN-5IotHBzdf1XRmi8GOjxzNlAARExOxS5A~jwBFp-snD3Ao~AXhIjs.wW0c~YJtuK.y.3M-TNnKKbe63bl3uBlMHrtq8~vq4qq-ki61Sy8Kz3veLMmBot8b0ks'
  const token2 =
    'Sb4mzgF3Opg3XmkGM8lImUNRNvYrE_yO7hh6~B5MZG10-ndmaAbdVYTLknPN7zvO5STvHv-tuWHbW4bYpvszS0T.510f~WnjwMb3yAWJTJyITvWdhhoZPLBhPgZqe2IX'
  const token3 =
    'pzPBcaN-5IotHBzdf1XRmi8GOjxzNlAARExOxS5A~jwBFp-snD3Ao~AXhIjs.wW0c~YJtuK.y.3M-TNnKKbe63bl3uBlMHrtq8~vq4qq-ki61Sy8Kz3veLMmBot8b0ks'

  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <div>
            <Link
              to={`/attendance?accessToken=${token1}&fullName=Roman Gutierrez (Help)&email=roman.gutierrez@gmail.com&idpUserId=13`}
            >
              Help User
            </Link>
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Johnny Nimbus&email=cespin+1@gmail.com&idpUserId=6`}
            >
              Attendees
            </Link>
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
            {/* <Link to='/'>Track 1</Link>
            <Link to='/a'>Track 2</Link>
            <button onClick={handleSignOutClick}>SignOut</button> */}
            <AttendeeToAttendeeContainer title='Attendance' {...widgetProps} />
            {/* <Tracker {...widgetProps} ref={trackerRef} /> */}
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
