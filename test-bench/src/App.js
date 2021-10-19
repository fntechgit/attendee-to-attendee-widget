import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TrackedPageExample from './TrackedPageExample'

import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const token1 =
    'DG-gRfEcqXb-MABmjPVIpIcWBFR1y5dPowxwWrAJT0H.Q4OCvs0J1FCpjEk4~3kr56h0A_QUfoNPZQzqI7OpCYxhiXDER4LWWtJ8pb1oN_40ambCYAh_Zs.pwRqGe.2c'
  const token2 =
    'p-XAPURHZSNJXTam8vx3JwpXNPpsylLHgHWWrPTf4g5W9Ihxv~qy7I9LPvURYw9US2Q2n8pSC_mnglC1iCr07y.x8hixDMSAOYwOlTSfEykrNDIn6bZ2~Z-jLmr3EDIZ'
  const token3 =
    'Z.txbiYmeZGtWj.kK1R14RMe~mAqTize~scBvfJVj2JDtWlAfIarw5P5lZaTXps4Ll.VR13c4a.htchbwtL6TmHyOxOJd6WnfNyy93DzX2UmCjAZiEKVtYjQE2w7lstx'
  const token4 =
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
              Attendee 1
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token3}&fullName=Joe Alternate&email=cespin+7@gmail.com&idpUserId=1108`}
            >
              Attendee 2
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
