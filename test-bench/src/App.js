import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Tracker, RealTimeAttendeesList } from 'attendee-to-attendee-widget'
import 'attendee-to-attendee-widget/dist/index.css'

const widgetProps = {
  user: {
    fullName: '',
    email: '',
    picUrl: 'https://i1.wp.com/dayinlab.com/wp-content/uploads/2018/04/iron-man.jpg?resize=470%2C260'
  },
  summitId: 8,
};

const App = () => {
  const rnd = Math.floor(Math.random() * 10) + 1
  widgetProps.user.fullName = `Test User ${rnd}`
  widgetProps.user.email = `test${rnd}@nomail.com`

  const handleItemClick = (itemInfo) => {
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
              <RealTimeAttendeesList className="widget-container" onItemClick={handleItemClick} />
            </div>
          </Route>
        </Switch>
    </Router>
  );
}

export default App