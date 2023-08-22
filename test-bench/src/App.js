import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TrackedPageExample from './TrackedPageExample'

import 'attendee-to-attendee-widget/dist/index.css'

const App = () => {
  const token1 =
    'jzsc0kF-dFOaI6iQGbAIf87-sQ_~cRI89R.sGFBPEXG8CxFW6uDvpE0uz0gm5kvXY_zxc7InCX0pH4x8MYb.7StvzgafyMOnKu4CUrcXYoUF7_HvpMx8D9XSI3uA~G8x'
  const token2 =
    'jzsc0kF-dFOaI6iQGbAIf87-sQ_~cRI89R.sGFBPEXG8CxFW6uDvpE0uz0gm5kvXY_zxc7InCX0pH4x8MYb.7StvzgafyMOnKu4CUrcXYoUF7_HvpMx8D9XSI3uA~G8x'
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
