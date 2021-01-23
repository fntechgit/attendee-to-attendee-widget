# attendees-tracking-widget

> Real time attendees tracking widget

[![NPM](https://img.shields.io/npm/v/attendees-tracking-widget.svg)](https://www.npmjs.com/package/attendees-tracking-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save attendees-tracking-widget
```

## Usage

```jsx
import React, { Component } from 'react'

import { Tracker, RealTimeAttendeesList } from 'attendee-to-attendee-widget'
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