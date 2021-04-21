import React, { useState } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList, { scopes } from '../AttendeesList/AttendeesList'
import { makeStyles, Paper, Tab, Tabs, Box } from '@material-ui/core'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { MainBar } from '../MainBar/MainBar'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Chilanka', 'cursive'].join(',')
  }
})

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  }
})

const RealTimeAttendeesList = (props) => {
  const [value, setValue] = useState(0)
  const { supabaseUrl, supabaseKey, user } = props
  props = { ...props, url: window.location.href.split('?')[0] }

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey, user)
  }

  const classes = useStyles()
  const handleTabSelect = (event, newValue) => {
    setValue(newValue)
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
      <div
        role='tabpanel'
        hidden={value !== index}
        id={`scrollable-force-tabpanel-${index}`}
        {...other}
      >
        {value === index && <Box p={1}>{children}</Box>}
      </div>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={style.widgetContainer}>
        <MainBar user={user} />
        <hr />
        <Paper className={classes.root}>
          <Tabs value={value} onChange={handleTabSelect} variant='fullWidth'>
            <Tab label='ATTENDEES' />
            <Tab label='MESSAGES' />
            <Tab label='ROOM CHATS' />
          </Tabs>
        </Paper>
        <TabPanel value={value} index={0}>
          <AttendeesList
            {...props}
            accessRepo={accessRepo}
            chatRepo={chatRepo}
            scope={scopes.SHOW}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          {/* <AttendeesList {...props} accessRepo={accessRepo} chatRepo={chatRepo} scope={scopes.SHOW} /> */}
        </TabPanel>
        <TabPanel value={value} index={2}>
          {/* <AttendeesList {...props} accessRepo={accessRepo} chatRepo={chatRepo} scope={scopes.SHOW} /> */}
        </TabPanel>
      </div>
    </ThemeProvider>
  )
}

export default RealTimeAttendeesList
