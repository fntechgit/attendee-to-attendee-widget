import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TrackedPageExample from './TrackedPageExample'

import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const token1 =
    'LEG2zfDD4w2mr01CqnBmYBznGbDvJFbtdDqnOXWWF~2pQ4v3FFW2P4uT3oTXCE1Ktg4yRIn4EXWom~UQXftff7GwNovWD.4-IVeWsK~IW94VX18FTJ7J4qUQLxHw7a.i'
  const token2 =
    'hJKOJ11ymwaUXq91e7gM-uEwx-25A.WDGPx0V8SL09-cEwD.WGko5XK8bRc8FnVMlsb-W8E8WJJYGVj_eMIQs0hREXP0tYs5HPlH7Drw92Ci2rfbrr9jC_~6nJeB8NYY'
  const token3 =
    'l~23GCO2zSh9Dix.6iTQbLOPzaC97o_ifhQeCJDkDWEsZz6OmMiCi1W3lCU4_hXLzOVKB00n1XV6wFuw67T9XHfYM7AUBwkOSRr1r9ktMTDr~JwqYa.SsZqBoZe1PYkq'

  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <div>
            <Link
              to={`/attendance?accessToken=${token1}&fullName=Johnny Nimbus(Help)&email=cespin+1@gmail.com&idpUserId=6`}
            >
              Help User
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Roman Gutierrez&email=roman.gutierrez@gmail.com&idpUserId=13`}
            >
              Attendees
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Roman Gutierrez&email=roman_ag@hotmail.com&idpUserId=3338`}
            >
              Attendees Prod
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token3}&fullName=Jethro Stratus (Q&A)&email=cespin+2@gmail.com&idpUserId=7`}
            >
              QA User
            </Link>
          </div>
        </Route>
        <Route path='/attendance' component={TrackedPageExample} />
        <Route exact path='/untracked'>
          <div>Untracked page</div>
        </Route>
      </Switch>
    </Router>
  )
}

export default App
