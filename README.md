# attendees-tracking-widget

> Real time attendees tracking widget

[![NPM](https://img.shields.io/npm/v/attendee-to-attendee-widget.svg)](https://www.npmjs.com/package/attendee-to-attendee-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## PUBLISH TO NPM

1. npm version patch / npm version minor / npm version major
2. npm publish

## Usage
### As tracker
```jsx
import React from 'react'

import { Tracker } from 'attendee-to-attendee-widget'
import 'attendee-to-attendee-widget/dist/index.css'

const sbAuthProps = {
  supabaseUrl: process.env.GATSBY_SUPABASE_URL,
  supabaseKey: process.env.GATSBY_SUPABASE_KEY
};

const widgetProps = {
  user: {
    fullName: '...',
    email: '...',
    company: '...',
    title: '...',
    picUrl: '...'
  },
  onAttendeeClick: console.log,
  summitId: 8,
  ...sbAuthProps
};

const App = () => {
  return <Tracker {...widgetProps} />
}
```

### As attendees viewer
```jsx
import React from 'react'

import { RealTimeAttendeesList } from 'attendee-to-attendee-widget'
import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const handleItemClick = (itemInfo) => {
    console.log(itemInfo)
  }
  return <RealTimeAttendeesList onItemClick={handleItemClick} {...sbAuthProps} title='Looking at this page' summitId={widgetProps.summitId} />
}
```

##### For further information go to test-bench\src\App.js