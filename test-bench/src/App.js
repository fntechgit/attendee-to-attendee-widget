import React, { useRef, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Modal from 'react-modal'
import {
  AttendeeDetail,
  RealTimeAttendeesList,
  SimpleChat,
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

const customStyles = {
  content: {
    top: '20%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

const sbAuthProps = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_KEY
}

const streamioProps = {
  streamApiKey: '29gtgpyz5hht',
  apiBaseUrl: 'https://idp.dev.fnopen.com',
  forumSlug: 'fnvirtual-poc'
}

const chatProps = {
  accessToken: accessToken,
  onAuthError: (err, res) => console.log(err),
  openDir: 'left',
  title: '',
  showHelp: true,
  showQA: true,
  hideUsers: false
}

const widgetProps = {
  user: {
    fullName: '',
    email: '',
    company: '',
    title: '',
    picUrl: 'https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83',
		github_user: 'romanetar',	
		linked_in_profile: 'https://www.linkedin.com/in/rom%C3%A1n-gutierrez-pmp-7a001b6/',
		twitter_name: 'romanetar',
		wechat_user: '',
    badge_features: ['feat 1', 'feat 2'], //attendee.ticket.badge.features
  },
  summitId: 8,
  ...chatProps,
  ...sbAuthProps,
  ...streamioProps
}

Modal.setAppElement('#root')

const App = () => {
  const [modalIsOpen, setIsOpen] = useState(false)
  const [accessInfo, setAccessInfo] = useState({})
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
  widgetProps.user.idpUserId = idpUserId

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleItemClick = (itemInfo) => {
    //setAccessInfo(itemInfo)
    //openModal()
    //console.log(itemInfo)
    if (itemInfo.attendees.idp_user_id != widgetProps.user.idpUserId) {
      startOneToOneChat(itemInfo.attendees.idp_user_id)
    }
  }

  const handleCTA = (itemInfo) => {
    closeModal()
    //console.log(itemInfo)
    //startOneToOneChat(11)
  }

  const startOneToOneChat = (partnerId) => {
    chatRef.current.startOneToOneChat(partnerId)
  }

  const handleSignOutClick = () => {
    trackerRef.current.signOut()
  }

  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <div>
            <Link to='/attendance'>Attendees</Link>
            <Tracker {...widgetProps} />
          </div>
        </Route>
        <Route exact path='/a'>
          <div>
            <Link to='/attendance'>Attendees</Link>
            <Tracker {...widgetProps} />
          </div>
        </Route>
        <Route path='/attendance'>
          <div style={{ width: '500px', margin: '20px auto' }}>
            {/* <Link to='/'>Track 1</Link>
            <Link to='/a'>Track 2</Link>
            <button onClick={handleSignOutClick}>SignOut</button> */}
            <RealTimeAttendeesList
              onItemClick={handleItemClick}
              title='Attendance'
              {...widgetProps}
            />
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel='Attendee'
            >
              <AttendeeDetail accessInfo={accessInfo} onCTA={handleCTA} />
            </Modal>
            {/* <Tracker {...widgetProps} ref={trackerRef} /> */}
            <SimpleChat {...widgetProps} ref={chatRef} />
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
