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

import React, { useEffect, useRef } from "react";
import { Tabs, ActiveTabContent } from "../Tabs/Tabs";
import { useStore } from "../../lib/Store";
import {
  useAttendeesNews,
  useUpdateAttendeesNews
} from "../../lib/attendeesContext";
import { useFilterSettings } from "../../lib/filterSettingsContext";
import { scopes } from "../../models/scopes";
import { ATTENDEES_LIST_PAGE_SIZE } from "../../lib/constants";

export function MainContent({
  accessRepo,
  activeTab,
  activeTabContent,
  changeActiveTab,
  summitId,
  tabList,
  url
}) {
  const attendeesList = useAttendeesNews();
  const setAttendeesList = useUpdateAttendeesNews();
  const currentFilterMode = useFilterSettings();
  const attendeesListLength = useRef(0);
  const selectedFilterScope = useRef("");

  const { attendeesNews } = useStore({
    url,
    summitId,
    accessRepository: accessRepo
  });

  const updateAttendeesList = (promise) => {
    promise
      .then((response) => {
        if (response && response.length > 0) {
          setAttendeesList(accessRepo.sortByAttName(response));
          attendeesListLength.current = response.length;
        } else {
          setAttendeesList([]);
          attendeesListLength.current = 0;
        }
      })
      .catch(console.error);
  };

  const forceFirstPageFetch = () => {
    if (selectedFilterScope.current === scopes.PAGE) {
      updateAttendeesList(
        accessRepo.fetchCurrentPageAttendees(url, 0, ATTENDEES_LIST_PAGE_SIZE)
      );
    } else {
      updateAttendeesList(
        accessRepo.fetchCurrentShowAttendees(0, ATTENDEES_LIST_PAGE_SIZE)
      );
    }
  };

  const onVisibilitychange = () => {
    if (document.visibilityState === "visible") {
      // ensure first list page fetch on tab focus in case real-time isn't working properly
      if (attendeesListLength.current < ATTENDEES_LIST_PAGE_SIZE) {
        forceFirstPageFetch();
      }
      accessRepo.refreshRealtimeSubscription();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilitychange);
    }
    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilitychange);
      }
    };
  }, []);

  // handle real-time updates
  useEffect(() => {
    if (attendeesNews && Object.keys(attendeesNews).length > 0) {
      console.log("rt att news", attendeesNews.id);
      // merge news
      let mergedList = accessRepo.mergeChanges(attendeesList, attendeesNews);

      if (currentFilterMode === scopes.PAGE) {
        mergedList = accessRepo.filterSameURLAttendees(mergedList, url);
      }

      if (mergedList && mergedList.length > 0) {
        attendeesListLength.current = mergedList.length;
        setAttendeesList(mergedList);
      }
    }
  }, [attendeesNews]);

  useEffect(() => {
    selectedFilterScope.current = currentFilterMode;
    forceFirstPageFetch();
    accessRepo.refreshRealtimeSubscription();
  }, [currentFilterMode]);

  return (
    <div className="mt-2">
      <Tabs
        tabList={tabList}
        activeTab={activeTab}
        changeActiveTab={changeActiveTab}
      />
      {accessRepo && (
        <ActiveTabContent key={activeTab} content={activeTabContent()} />
      )}
    </div>
  );
}
