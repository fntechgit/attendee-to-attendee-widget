import React, {useRef, useState} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Modal from 'react-modal'
import { AttendeeDetail, RealTimeAttendeesList, SimpleChat, Tracker } from 'attendee-to-attendee-widget'
import 'attendee-to-attendee-widget/dist/index.css'

const customStyles = {
  content : {
    top                   : '20%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

const sbAuthProps = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_KEY
};

const streamioProps = {
  streamApiKey: '29gtgpyz5hht',
  apiBaseUrl: 'https://idp.dev.fnopen.com',
  forumSlug: 'fnvirtual-poc'
};

const accessToken = 'JWdgJBUh-J3BvIUfWE7jlfaFY-gaxifZzl96ZeGrol-0-8dHeIhcVqZ_QjhNkd-N1bNZWyI963W9M_kBwaWNx-IQSwN0vAYeVsrx-KTaa~-iCl~spU~N2_Wlq4qqvW0W'

const chatProps = {
  accessToken: accessToken,
  onAuthError: (err, res) => console.log(err),
  openDir: "left",
  title: "",
  showHelp: true,
  showQA: true,
  hideUsers: false,
  ...streamioProps
};

const widgetProps = {
  user: {
    fullName: '',
    email: '',
    company: '',
    title: '',
    picUrl: 'https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83'
  },
  summitId: 8,
  ...sbAuthProps,
};

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

  widgetProps.user.fullName = `Roman Gutierrez`
  widgetProps.user.email = `roman.gutierrez@gmail.com`
  widgetProps.user.company = `Tipit`
  widgetProps.user.title = `Full stack developer`
  widgetProps.user.idpUserId = 13


  const openModal = () => {
    setIsOpen(true);
  }
 
  const closeModal = () => {
    setIsOpen(false);
  }

  const handleItemClick = (itemInfo) => {
    //setAccessInfo(itemInfo)
    //openModal()
    //console.log(itemInfo)
    startOneToOneChat(11)
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
          <Route exact path="/">
            <div>
              <Link to='/attendance'>Attendees</Link>
              <Tracker {...widgetProps} />
            </div>
          </Route>
          <Route exact path="/a">
            <div>
              <Link to='/attendance'>Attendees</Link>
              <Tracker {...widgetProps} />
            </div>
          </Route>
          <Route path="/attendance">
            <div style={{width: '500px', margin: '20px auto'}}>
              <Link to='/'>Track 1</Link>
              <Link to='/a'>Track 2</Link>
              <button onClick={handleSignOutClick}>SignOut</button>
              <RealTimeAttendeesList onItemClick={handleItemClick} {...sbAuthProps} title='Attendance' summitId={widgetProps.summitId} />
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Attendee"
              >
                <AttendeeDetail accessInfo={accessInfo} onCTA={handleCTA} />
              </Modal>
              <Tracker {...widgetProps} ref={trackerRef} />
              <SimpleChat {...chatProps} ref={chatRef} />
            </div>
          </Route>
          <Route exact path="/untracked">
            <div>Untracked page</div>
          </Route>
        </Switch>
    </Router>
  );
}

export default App