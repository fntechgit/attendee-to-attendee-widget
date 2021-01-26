# attendees-tracking-widget

> Real time attendees tracking widget

[![NPM](https://img.shields.io/npm/v/attendees-tracking-widget.svg)](https://www.npmjs.com/package/attendee-to-attendee-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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
  return <RealTimeAttendeesList />
}
```