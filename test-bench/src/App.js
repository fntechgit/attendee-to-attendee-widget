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
  activityName: 'dev-keynote' //Widget will create this activity room or add members to it
}

const widgetProps = {
  user: {
    id: null,
    fullName: '',
    email: '',
    role: 'admin',
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
    'o1zF43o_wywOvDPnEhCXWx8j.zrdwoh-snok-.m7nrDdHzZuHgCvG38jCrYB-U7gWNVJ998fxGGazWG3kCHh-WN3.r5S-76qTllBVBFLpy0mCT3gvPagFa5r713TiZyC'
  const token2 =
    'DqPtsnDfx.XJt2BMSMfPXNtJQvgX5HLjgFXcxbM~Rw9kn9zd0Vd.6_nmSrGhhHfK-Webgo9_LncDYiaWdOC8qlRJRYIZvvCJO4ZXo0QM7LLprvuKfIFs96xG4pYx3PqP'
  const token3 =
    'DqPtsnDfx.XJt2BMSMfPXNtJQvgX5HLjgFXcxbM~Rw9kn9zd0Vd.6_nmSrGhhHfK-Webgo9_LncDYiaWdOC8qlRJRYIZvvCJO4ZXo0QM7LLprvuKfIFs96xG4pYx3PqP'

  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <div>
            <Link
              to={`/attendance?accessToken=${token1}&fullName=Roman Gutierrez&email=roman_ag@hotmail.com&idpUserId=13`}
            >
              Attendees 1
            </Link>
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Johnny Nimbus&email=cespin+1@gmail.com&idpUserId=6`}
            >
              Attendees 2
            </Link>
            <Link
              to={`/attendance?accessToken=${token3}&fullName=Jethro Stratus&email=cespin+2@gmail.com&idpUserId=7`}
            >
              Attendees 3
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
