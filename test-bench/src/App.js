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
  hideUsers: false
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
    badgeFeatures: ['feat 1', 'feat 2'], //attendee.ticket.badge.features
    bio: '# This is my bio, *in MD*!'
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

  const startOneToOneChat = (partnerId) => {
    chatRef.current.startOneToOneChat(partnerId)
  }

  const handleSignOutClick = () => {
    trackerRef.current.signOut()
  }

  const token1 =
    '-J74~C4HBzlnm.WkBmI-60~WZ3R97ePVCrDVxY.qT~mX4Q_Z0VdxcYJ~aTZUbOVFw_EDhh.Qs5cPnLUUZ.YuFpnSLEIB5H0MivX7wGQ6_Y9YT2_3a3oh-1Glx4QD~pXN'
  const token2 =
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
              to={`/attendance?accessToken=${token2}&fullName=Abril Gutierrez&email=roman.gutierrez@hotmail.com&idpUserId=11`}
            >
              Attendees 2
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
