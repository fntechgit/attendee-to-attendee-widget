import React, { useEffect, useRef, useState } from 'react'
import {
  AttendeeToAttendeeContainer,
  permissions,
  Tracker
} from 'attendee-to-attendee-widget'
import { Link } from 'react-router-dom'

const sbAuthProps = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_KEY
}

const chatProps = {
  streamApiKey: '29gtgpyz5hht',
  apiBaseUrl: 'https://idp.dev.fnopen.com',
  chatApiBaseUrl: 'https://chat-api.dev.fnopen.com',
  forumSlug: 'fnvirtual-poc',
  getAccessToken: async () => {},
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
    showEmail: false,
    allowChatWithMe: true,
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
    bio: '# This is my bio, *in MD*!', //bio: '<p><span>This is my bio in HTML</span></p>'
    getBadgeFeatures: () => {
      return [
        {
          name: 'Feat A',
          image:
            'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
        },
        {
          name: 'Feat B',
          image:
            'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
        },
        {
          name: 'Feat C',
          image:
            'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
        },
        {
          name: 'Feat D',
          image:
            'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
        }
        ,
        {
          name: 'Feat E',
          image:
            'https://www.instituteofexcellence.com/wp-content/uploads/check-mark-badge.png'
        }
      ] //attendee.ticket.badge.features
    },
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

const TrackedPageExample = () => {
  const [loading, setLoading] = useState(true)
  const trackerRef = useRef()
  const sdcRef = useRef()
  const shcRef = useRef()
  const sqacRef = useRef()
  const ocrRef = useRef()

  useEffect(() => {
    setLoading(true)

    const accessToken = findGetParameter('accessToken')
    const fullName = findGetParameter('fullName')
    const email = findGetParameter('email')
    const idpUserId = findGetParameter('idpUserId')
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
    widgetProps.getAccessToken = async () => accessToken

    setLoading(false)
  }, [])

  const findGetParameter = (parameterName) => {
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

  const handleSignOutClick = () => {
    trackerRef.current.signOut()
  }

  return (
    !loading && (
      <div
        style={{
          width: '420px',
          margin: '20px auto',
          position: 'relative'
        }}
      >
        <Link to={'/'}>
          Back
        </Link>
        <AttendeeToAttendeeContainer
          {...widgetProps}
          ref={{ sdcRef, shcRef, sqacRef, ocrRef }}
        />
        <Tracker {...widgetProps} ref={trackerRef} />
        <br />
        <hr />
        <button onClick={handleSignOutClick}>SignOut</button>
        <button onClick={() => startDirectChat('7')}>Start Direct Chat</button>
        <button onClick={() => openChatRoom('578133244')}>
          Open Chat Room
        </button>
        <button onClick={startHelpChat}>Start Help Chat</button>
        <button onClick={startQAChat}>Start Q&A Chat</button>
      </div>
    )
  )
}

export default TrackedPageExample
