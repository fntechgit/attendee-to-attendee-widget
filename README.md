# attendees-tracking-widget

> Real time attendees tracking widget

[![NPM](https://img.shields.io/npm/v/attendee-to-attendee-widget.svg)](https://www.npmjs.com/package/attendee-to-attendee-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## PUBLISH TO NPM

1. npm version patch / npm version minor / npm version major
2. npm publish

## Usage

### As tracker

```jsx
import React, { useRef } from 'react'
import { Tracker } from 'attendee-to-attendee-widget'
import 'attendee-to-attendee-widget/dist/index.css'

const sbAuthProps = {
  supabaseUrl: process.env.GATSBY_SUPABASE_URL,
  supabaseKey: process.env.GATSBY_SUPABASE_KEY
}

const widgetProps = {
  user: {
    fullName: FULL_NAME,
    email: EMAIL,
    company: COMPANY,
    title: JOB_TITLE,
    picUrl: PROFILE_PIC_URL,
    socialInfo: {
      githubUser: GITHUB_USER_NAME,
      linkedInProfile: LINKED_IN_PROFILE_NAME,
      twitterName: TWITTER_USER_NAME,
      wechatUser: WECHAT_USER_NAME
    },
    badgeFeatures: [
      {
        title: BADGE_TITLE,
        imgUrl: BADGE_IMAGE_URL
      },
      ...
    ], //attendee.ticket.badge.features
    bio: BIO, //Could be in Markdown format or HTML
  },
  summitId: 8,
  ...sbAuthProps
}

const App = () => {
  const trackerRef = useRef()

  const handleSignOut = () => {
    trackerRef.current.signOut()
  }

  return <Tracker {...widgetProps} ref={trackerRef} />
}
```

### As attendees viewer

```jsx
import React from 'react'

import {
  AttendeeToAttendeeContainer,
  permissions
} from 'attendee-to-attendee-widget'
import 'attendee-to-attendee-widget/dist/index.css'

const sbAuthProps = {
  supabaseUrl: ...,
  supabaseKey: ...
}

const adminGroups = ['administrators', 'super-admins']

export const AttendeesWidget = ({ user, event }) => {
  //Deep linking support
  const chatRef = useRef()

  useEffect(() => {
    const starHelpChatParam = getUrlParam('starthelpchat')
    const starQAChatParam = getUrlParam('startqachat')
    const starDirectChatParam = getUrlParam('startdirectchat')
    const openChatRoomParam = getUrlParam('openchatroom')
    ...
  }, [])

  const { email, first_name, last_name, bio, groups } = user.userProfile
  const {
    picture,
    company,
    job_title,
    sub,
    github_user,
    linked_in_profile,
    twitter_name,
    wechat_user
  } = user.idpProfile

  const chatProps = {
    streamApiKey: ...,
    apiBaseUrl: ...,
    chatApiBaseUrl: ...,
    forumSlug: ...,
    onAuthError: (err, res) => console.log(err),
    openDir: 'left',
    activity: null,
    getAccessToken: async () => {
      ...
    }
  }

  if (event) {
    //Widget will create this activity room or add members to it
    chatProps.activity = {
      id: event.id,
      name: event.title,
      imgUrl: event.image
    }
  }

  const widgetProps = {
    user: {
      id: IDP_USER_ID,
      idpUserId: IDP_USER_ID,
      hasPermission: (permission) => {
        switch (permission) {
          case permissions.MANAGE_ROOMS:
            return false
          case permissions.CHAT:
            return true
          default:
            return false
        }
      }
    },
    summitId: SUMMIT_ID,
    height: WIDGET_HEIGHT || 400,
    ...chatProps,
    ...sbAuthProps
  }

  return <AttendeeToAttendeeContainer {...widgetProps} ref={chatRef} />
}
```

### Deep linking

This feature is activated by setting url hash parameters

#### Allowed parameters

- \#starthelpchat=true - It will open a help chat
- \#startqachat=true - It will open a q&a chat related to the current event
- \#startdirectchat=[counterpart idp user id] - It will open a chat with the user whose id is passed as a value
- \#openchatroom=[room id] - It will open the chat room which id is [room id]

##### For further information go to test-bench\src\App.js
