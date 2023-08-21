import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TrackedPageExample from './TrackedPageExample'

import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const token1 =
    'g28sqdLbVAF8t6WW2vLfUGF22QSaXKZkQv4zR457AA1qTtjMqIcpP-QuSLO9YXPlv_GOnfD~co_.K7nfEdM90m4F6IWrysbxFKj~JQeD_yGse9T-St0XgefPLg_sg05W'
  const token2 =
    'AanI.~Fom9n4ILLxu~dfWAKT9SiX0PnafkqPrX-EIlS4IbyRvuL61ukjvJlegej.XmK2gi63VQuNzD8TQ4PKHSs0.mYSXfVsqS~B7xeKrZrcB6TPjVLWP3M59A~NPuPq'
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
              to={`/attendance?accessToken=${token1}&fullName=Me&email=roman.gutierrez@gmail.com&idpUserId=13`}
            >
              Me
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Clint23&email=cespin+23@gmail.com&idpUserId=4945`}
            >
              cespin+23@gmail.com
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token3}&fullName=Clint24&email=cespin+24@gmail.com&idpUserId=4946`}
            >
              cespin+24@gmail.com
            </Link>
            <br />
            <Link
              to={`/attendance?accessToken=${token2}&fullName=Clint Espinoza&email=cespin@gmail.com&idpUserId=2`}
            >
              cespin@gmail.com
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
