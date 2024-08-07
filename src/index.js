/**
 * Copyright 2021 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import TrackedPageExample from "./TrackedPageExample";

import "./index.css";

function App() {
  const token1 =
    "JrYPsjBELq9SjKFNPCB902X8w0vcDfvrG1ThUKB3yKmOwAKlUvseGAcFQ3vQ21U-tJXR74WFMTn_qkMNE9J08i6yUY-zU3b2G3I6~NOcpHYNrhPIpNMzakuOkpkmmxFi";
  const token2 =
    "JrYPsjBELq9SjKFNPCB902X8w0vcDfvrG1ThUKB3yKmOwAKlUvseGAcFQ3vQ21U-tJXR74WFMTn_qkMNE9J08i6yUY-zU3b2G3I6~NOcpHYNrhPIpNMzakuOkpkmmxFi";
  const token3 =
    "JrYPsjBELq9SjKFNPCB902X8w0vcDfvrG1ThUKB3yKmOwAKlUvseGAcFQ3vQ21U-tJXR74WFMTn_qkMNE9J08i6yUY-zU3b2G3I6~NOcpHYNrhPIpNMzakuOkpkmmxFi";
  // const token4 =
  //   'l~23GCO2zSh9Dix.6iTQbLOPzaC97o_ifhQeCJDkDWEsZz6OmMiCi1W3lCU4_hXLzOVKB00n1XV6wFuw67T9XHfYM7AUBwkOSRr1r9ktMTDr~JwqYa.SsZqBoZe1PYkq'

  return (
    <Router>
      <Switch>
        <Route exact path="/">
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
        <Route path="/attendance" component={TrackedPageExample} />
        <Route exact path="/untracked">
          <div>Untracked page</div>
        </Route>
      </Switch>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
