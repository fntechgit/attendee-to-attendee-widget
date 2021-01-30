import React, {useState} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
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
    picUrl: 'https://i1.wp.com/dayinlab.com/wp-content/uploads/2018/04/iron-man.jpg?resize=470%2C260'
  },
  summitId: 8,
  ...sbAuthProps
};

Modal.setAppElement('#root')

const App = () => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [accessInfo, setAccessInfo] = useState({});

  const rnd = Math.floor(Math.random() * 10) + 1
  widgetProps.user.fullName = `Test User ${rnd}`
  widgetProps.user.email = `test${rnd}@nomail.com`

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
             <Tracker {...widgetProps} />
          </Route>
          <Route path="/attendance">
            <div style={{width: '500px', margin: '20px auto'}}>
              <RealTimeAttendeesList onItemClick={handleItemClick} {...sbAuthProps} />
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
        </Switch>
    </Router>
  );
}

export default App