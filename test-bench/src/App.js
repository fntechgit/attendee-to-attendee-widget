import React, {useState} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Modal from 'react-modal'
import { Tracker, RealTimeAttendeesList, AttendeeDetail } from 'attendee-to-attendee-widget'
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

const widgetProps = {
  user: {
    fullName: '',
    email: '',
    company: '',
    title: '',
    picUrl: 'https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83'
  },
  summitId: 8,
  ...sbAuthProps
};

Modal.setAppElement('#root')

const App = () => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [accessInfo, setAccessInfo] = useState({});

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
    setAccessInfo(itemInfo)
    openModal()
    //console.log(itemInfo)
  }

  const handleCTA = (itemInfo) => {
    closeModal()
    console.log(itemInfo)
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
              <Tracker {...widgetProps} />
              <RealTimeAttendeesList onItemClick={handleItemClick} {...sbAuthProps} title='Attendance' summitId={widgetProps.summitId} />
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Attendee"
              >
                <AttendeeDetail accessInfo={accessInfo} onCTA={handleCTA} />
              </Modal>
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