import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TrackedPageExample from './TrackedPageExample'

import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const token1 =
    'gnHoEGBiDU9NZ3QLMn4j2Ny5FW.5QdPcIHg~1YLnORopvmr1._ycIV4x34REDgGZEIzRjhv-mp-p1m5OG3AVqi2aJOhlTyo_JFoNfozy73OyVKg_yTjWNzSNug1EZri~'
  const token2 =
    't2CZDf76UY-wWlqxj-I_ow7Ad.m8odGJz.v-G0Mi~91mc39_No03FuRrqx4B1LLX1mnpio3r9rCpGPjaVy.PzwXZi6rb.i7HpCTNGddU7RiO-BVbR8x0a3mlofAo1pjD'
  const token3 =
    'Z.txbiYmeZGtWj.kK1R14RMe~mAqTize~scBvfJVj2JDtWlAfIarw5P5lZaTXps4Ll.VR13c4a.htchbwtL6TmHyOxOJd6WnfNyy93DzX2UmCjAZiEKVtYjQE2w7lstx'
  // const token4 =
  //   'l~23GCO2zSh9Dix.6iTQbLOPzaC97o_ifhQeCJDkDWEsZz6OmMiCi1W3lCU4_hXLzOVKB00n1XV6wFuw67T9XHfYM7AUBwkOSRr1r9ktMTDr~JwqYa.SsZqBoZe1PYkq'

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
