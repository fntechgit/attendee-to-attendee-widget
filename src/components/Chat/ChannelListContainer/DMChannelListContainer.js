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

import React, { useEffect, useState } from "react";
import { Chat } from "stream-chat-react";
import debounce from "lodash.debounce";
import { SearchBar } from "../../SearchBar/SearchBar";
import ChannelListContainer from "./ChannelListContainer";
import { channelTypes } from "../../../models/channelTypes";
import { roles } from "../../../models/userRoles";

import style from "./style.module.scss";

let handleSearchDebounce = null;

function DMChannelListContainer({
  accessRepo,
  chatClient,
  height,
  summitId,
  onHelpClick,
  onItemClick,
  onQAClick,
  user,
  showHelpButton,
  showQAButton
}) {
  const defaultScope = [
    channelTypes.HELP_ROOM,
    channelTypes.QA_ROOM,
    channelTypes.MESSAGING
  ];

  const defaultFilters = {
    type: { $in: defaultScope },
    members: { $in: [user.id] }
  };

  const [currFilters, setCurrFilters] = useState(null);

  useEffect(() => {
    const userId = chatClient.user.id;
    const userRole = chatClient.user.local_role;
    if (userRole === roles.HELP) {
      setCurrFilters({
        type: { $in: [channelTypes.HELP_ROOM] },
        members: { $in: [userId] }
      });
    } else if (userRole === roles.QA) {
      setCurrFilters({
        type: { $in: [channelTypes.QA_ROOM] },
        members: { $in: [userId] }
      });
    } else {
      setCurrFilters(defaultFilters);
    }
  }, []);

  const handleSearch = async (e) => {
    const { value } = e.target;
    if (!value) {
      setCurrFilters(defaultFilters);
      return;
    }
    const timeout = 300;
    if (handleSearchDebounce) handleSearchDebounce.cancel();
    handleSearchDebounce = debounce(async () => {
      // Fetch attendee info for matched user names
      const res = await accessRepo.findByNameOrCompany(value);

      if (res && res.length > 0) {
        let channelIds = res.map((att) => `${user.id}-${att.idp_user_id}`);
        channelIds = [
          ...res.map((att) => `${att.idp_user_id}-${user.id}`),
          ...channelIds
        ];
        setCurrFilters({
          $or: [
            {
              type: { $in: [channelTypes.HELP_ROOM, channelTypes.QA_ROOM] },
              members: { $in: [user.id] }
            },
            {
              type: { $in: defaultScope },
              id: { $in: channelIds },
              members: { $in: [user.id] }
            }
          ]
        });
      }
    }, timeout);

    handleSearchDebounce();
  };

  const handleSearchClear = () => {
    setCurrFilters(defaultFilters);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} onClear={handleSearchClear} />
      {currFilters && (
        <div className={style.channelsListWrapper} style={{ height }}>
          <Chat client={chatClient}>
            <ChannelListContainer
              filters={currFilters}
              // sort={{ supporttype: 1 }}
              sort={{ last_message_at: -1 }}
              options={{ watch: true, limit: 20 }}
              user={user}
              summitId={summitId}
              chatClient={chatClient}
              accessRepo={accessRepo}
              onItemClick={onItemClick}
            />
          </Chat>
        </div>
      )}
      <div className="has-text-centered mt-2">
        {showHelpButton && (
          <button
            className={`${style.button} button is-large`}
            type="button"
            onClick={onHelpClick}
          >
            <span className="icon">
              <i className="fa fa-question-circle" />
            </span>
            <span>Help Desk</span>
          </button>
        )}
        {showQAButton && (
          <button
            className={`${style.button} button is-large ml-4`}
            type="button"
            onClick={onQAClick}
          >
            <span className="icon">
              <i className="fa fa-comments" />
            </span>
            <span>Q&A</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default DMChannelListContainer;
