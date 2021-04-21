import React, { useState } from 'react'
import AccessRepository from '../../lib/repository/AccessRepository'
import ChatRepository from '../../lib/repository/ChatRepository'
import AttendeesList, { scopes } from '../AttendeesList/AttendeesList'
import { makeStyles, withStyles , Paper, Tab, Tabs, Box } from '@material-ui/core'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { MainBar } from '../MainBar/MainBar'

import style from './style.module.scss'

let accessRepo = null
let chatRepo = null

const theme = createMuiTheme({
  typography: {
    //fontFamily: ['Chilanka', 'cursive'].join(','),
  },
  components: {
    MuiIcon: {
      styleOverrides: {
        root: {
          // Match 24px = 3 * 2 + 1.125 * 16
          boxSizing: 'content-box',
          padding: 3,
          fontSize: '1.125rem',
        },
      },
    },
  },
})

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  }
})

const RealTimeAttendeesList = (props) => {
  const classes = useStyles()
  const [value, setValue] = useState(0)

  const { supabaseUrl, supabaseKey, user } = props
  props = { ...props, url: window.location.href.split('?')[0] }

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }

  if (!chatRepo) {
    chatRepo = new ChatRepository(supabaseUrl, supabaseKey, user)
  }

  const AntTabs = withStyles({
    root: {
      borderBottom: '1px solid #e8e8e8',
    },
    indicator: {
      backgroundColor: '#1890ff',
    },
  })(Tabs);
  
  const AntTab = withStyles((theme) => ({
    root: {
      textTransform: 'none',
      minWidth: 72,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(4),
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:hover': {
        color: '#40a9ff',
        opacity: 1,
      },
      '&$selected': {
        color: '#1890ff',
        fontWeight: theme.typography.fontWeightMedium,
      },
      '&:focus': {
        color: '#40a9ff',
      },
    },
    selected: {},
  }))((props) => <Tab disableRipple {...props} />);

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
        <div className={classes.root}>
        <AntTabs value={value} onChange={handleTabSelect}>
            <AntTab label='ATTENDEES' />
            <AntTab label='MESSAGES' />
            <AntTab label='ROOM CHATS' />
          </AntTabs>
        </div>
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
