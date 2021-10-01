import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TrackedPageExample from './TrackedPageExample'

import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const token1 =
    'u5TFhtuPWczpedX_~v_QFKI80yJpcCrVkpSlcWp8jnLNt7Gnn.DsiXBcrhVrbAugNjD8krZ6u_9rJ18qnzVSv.222SHX5p3iVy-L27BnYe2_czFikQh9N5HeDK-CZAWn'
  const token2 =
    '9uOkwqWgaeBHY_MK.VGQsE_LAZ83Bk2TRX~fMyatgOT-FoLXU3xdhf58Tnx0ElCkT2tw5aDxu8-laaaOuOJqyq4sjrWi8IzAXPokST16Q-DQ37e8q-Vaof6NXnTar4PA'
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
