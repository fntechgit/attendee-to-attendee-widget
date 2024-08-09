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

import React, { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import Tracker from "./components/Tracker";

function TrackedOnlyPageExample() {
  const [widgetProps, setWidgetProps] = useState(null);
  const trackerRef = useRef();

  useEffect(() => {
    const accessToken = findGetParameter("accessToken");
    const fullName = findGetParameter("fullName");
    const email = findGetParameter("email");
    const idpUserId = findGetParameter("idpUserId");

    const wp = { user: {} };
    wp.user.fullName = fullName;
    wp.user.email = email;
    wp.user.company = "Tipit";
    wp.user.title = "Full stack developer";
    wp.user.id = idpUserId;
    wp.user.idpUserId = idpUserId;
    wp.getAccessToken = async () => accessToken;
    wp.user.showEmail = true;
    wp.user.showFullName = true;
    wp.user.allowChatWithMe = true;
    wp.user.showProfilePic = true;
    wp.user.showSocialInfo = true;
    wp.user.showBio = true;
    wp.user.company = "";
    wp.user.bio = "# This is my bio, *in MD*!";
    wp.user.title = "";
    wp.user.picUrl =
      "https://www.gravatar.com/avatar/ed3aa6518abef1c091b9a891b8f43e83";
    wp.user.getBadgeFeatures = () => [];
    wp.supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    wp.supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
    wp.summitId = 63;

    setWidgetProps(wp);
  }, []);

  const findGetParameter = (parameterName) => {
    let result = null;
    let tmp = [];
    window.location.search
      .substr(1)
      .split("&")
      .forEach((item) => {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
      });
    return result;
  };

  const handleUpdateProfile = () => {
    const wp = { ...widgetProps };
    wp.user.showFullName = !widgetProps.user.showFullName;
    setWidgetProps(wp);
  };

  return (
    widgetProps && (
      <div>
        <Link to="/">Back</Link>
        <Tracker {...widgetProps} ref={trackerRef} />
        <br />
        <hr />
        <button type="button" onClick={handleUpdateProfile}>
          Update Profile
        </button>
      </div>
    )
  );
}

export default TrackedOnlyPageExample;
