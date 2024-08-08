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

import PropTypes from "prop-types";
import { forwardRef, useImperativeHandle, useCallback, useEffect } from "react";
import { extractBaseUrl } from "../utils/urlHelper";
import { trackingLevel } from "../models/trackingLevel";
import SupabaseClientBuilder from "../lib/builders/supabaseClientBuilder";
import AccessRepository from "../lib/repository/AccessRepository";

const Tracker = forwardRef((props, ref) => {
  const { supabaseUrl, supabaseKey, summitId, user, fullUpdate } = props;
  let accessRepo = null;
  const pendingOps = new Set();
  let timerHandler = null;

  const trackAccess = async () => {
    accessRepo.trackAccess(
      user,
      extractBaseUrl(window.location.href),
      true,
      fullUpdate
    );
  };

  const startKeepAlive = () => {
    const timeout = 300000;
    stopKeepAlive();
    timerHandler = setInterval(() => {
      trackAccess();
    }, timeout);
  };

  const stopKeepAlive = () => {
    if (timerHandler) {
      clearInterval(timerHandler);
      timerHandler = null;
    }
  };

  const onLeave = async () => {
    // console.log('leaving tracked page')
    await accessRepo.trackAccess(props.user, "", false, false);
  };

  function addToPendingWork(promise) {
    pendingOps.add(promise);
    const cleanup = () => pendingOps.delete(promise);
    promise.then(cleanup).catch(cleanup);
  }

  const onBeforeUnload = useCallback((e) => {
    const promise = accessRepo.cleanUpAccess();
    if (promise) {
      addToPendingWork(promise);
    }
    if (pendingOps.size) {
      e.returnValue = "Are you sure you want to leave?";
    }
  }, []);

  const onVisibilitychange = useCallback(() => {
    if (document.visibilityState === "visible") {
      trackAccess();
    } else {
      onLeave();
    }
  }, []);

  const switchOff = () => {
    if (props.keepAliveEnabled) stopKeepAlive();
    if (typeof window !== "undefined") {
      const pageScopeTracking =
        props.trackingLevel === trackingLevel.PAGE_SCOPED_PRESENCE;
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (pageScopeTracking)
        document.removeEventListener("visibilitychange", onVisibilitychange);
    }
  };

  useEffect(() => {
    accessRepo = new AccessRepository(
      SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
      false,
      summitId
    );
    const pageScopeTracking =
      props.trackingLevel === trackingLevel.PAGE_SCOPED_PRESENCE;
    trackAccess();
    if (props.keepAliveEnabled) startKeepAlive();
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", onBeforeUnload);
      if (pageScopeTracking)
        document.addEventListener("visibilitychange", onVisibilitychange);
    }
    return () => {
      onLeave();
      switchOff();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    signOut() {
      switchOff();
      accessRepo?.signOut();
    },
    bindToWindowLifecycle() {
      console.log("bindToWindowLifecycle");
      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", onBeforeUnload);
      }
    },
    unbindFromWindowLifecycle() {
      console.log("unbindFromWindowLifecycle");
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", onBeforeUnload);
      }
    }
  }));
  return null;
});

Tracker.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired,
  summitId: PropTypes.number.isRequired,
  user: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    company: PropTypes.string,
    title: PropTypes.string,
    picUrl: PropTypes.string,
    socialInfo: PropTypes.shape({
      githubUser: PropTypes.string,
      linkedInProfile: PropTypes.string,
      twitterName: PropTypes.string,
      wechatUser: PropTypes.string
    }),
    bio: PropTypes.string,
    showEmail: PropTypes.bool,
    showFullName: PropTypes.bool,
    allowChatWithMe: PropTypes.bool,
    showProfilePic: PropTypes.bool,
    showSocialInfo: PropTypes.bool,
    showBio: PropTypes.bool
  }).isRequired,
  trackingLevel: PropTypes.string,
  keepAliveEnabled: PropTypes.bool
};

Tracker.defaultProps = {
  trackingLevel: trackingLevel.PAGE_SCOPED_PRESENCE,
  keepAliveEnabled: true
};

export default Tracker;
