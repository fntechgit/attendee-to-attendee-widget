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

const widgetProps = {
  user: {
    fullName: '...',
    email: '...',
    picUrl: '...'
  },
  onAttendeeClick: console.log,
  summitId: 8,
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
  return <RealTimeAttendeesList onItemClick={handleItemClick} />
}
```

##### For further information go to test-bench\src\App.js