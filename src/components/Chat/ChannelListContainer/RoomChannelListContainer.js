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

import React, { useState } from "react";
import { Chat } from "stream-chat-react";
import debounce from "lodash.debounce";
import { SearchBar } from "../../SearchBar/SearchBar";
import RoomsManager from "../RoomsManager/RoomsManager";
import ChannelListContainer from "./ChannelListContainer";
import { channelTypes } from "../../../models/channelTypes";
import { permissions } from "../../../models/permissions";

import style from "./style.module.scss";

let handleSearchDebounce = null;

function RoomChannelListContainer({
  user,
  summitId,
  chatClient,
  accessRepo,
  chatRepo,
  onHelpClick,
  onQAClick,
  onItemClick,
  onRoomDeleteClick,
  height,
  openDir,
  showHelpButton,
  showQAButton
}) {
  const defaultScope = [channelTypes.ACTIVITY_ROOM, channelTypes.CUSTOM_ROOM];

  let currentScope = defaultScope;

  const defaultFilters = {
    type: {
      $in: defaultScope
    }
  };
  const [currFilters, setCurrFilters] = useState(defaultFilters);
  const [showRoomsManager, setShowRoomsManager] = useState(false);

  const getScope = (mode) => {
    const modeOne = 1;
    const modeTwo = 2;
    if (mode === modeOne) return [channelTypes.ACTIVITY_ROOM];
    if (mode === modeTwo) return [channelTypes.CUSTOM_ROOM];
    return defaultScope;
  };

  const buildFilter = (scope, name) =>
    name
      ? {
          type: {
            $in: scope
          },
          name: { $eq: name }
        }
      : {
          type: {
            $in: scope
          }
        };

  const handleSearch = async (e) => {
    const timeout = 300;
    const { value } = e.target;
    if (handleSearchDebounce) handleSearchDebounce.cancel();
    handleSearchDebounce = debounce(async () => {
      setCurrFilters(value ? buildFilter(currentScope, value) : defaultFilters);
    }, timeout);

    handleSearchDebounce();
  };

  const handleSearchClear = async () => {
    setCurrFilters(defaultFilters);
  };

  const handleFilterModeChange = (mode) => {
    currentScope = getScope(mode);
    setCurrFilters(buildFilter(currentScope, null));
  };

  const handleRoomCreateClick = () => {
    setShowRoomsManager(true);
  };

  const handleBackClick = () => {
    setShowRoomsManager(false);
  };

  const handleRoomDelete = (channel) => {
    const timeout = 300;
    if (onRoomDeleteClick) onRoomDeleteClick();
    setTimeout(async () => {
      await chatRepo.deleteChannel(channel.id);
    }, timeout);
  };

  return (
    <div>
      {!showRoomsManager && (
        <div>
          <SearchBar
            onSearch={handleSearch}
            onClear={handleSearchClear}
            onFilterModeChange={handleFilterModeChange}
            // filterMenuOptions={[
            //   'All Chat Rooms',
            //   'Activity Rooms',
            //   'Custom Rooms'
            // ]}
            placeholder="Search by room name"
          />
          <div className={style.channelsListWrapper} style={{ height }}>
            <Chat client={chatClient}>
              <ChannelListContainer
                filters={currFilters}
                sort={{ created_at: 1 }}
                user={user}
                options={{ watch: true, limit: 20 }}
                summitId={summitId}
                chatClient={chatClient}
                onItemClick={onItemClick}
                onDelete={handleRoomDelete}
              />
            </Chat>
          </div>
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
                className={`${style.button} button is-large ml-3`}
                type="button"
                onClick={onQAClick}
              >
                <span className="icon">
                  <i className="fa fa-comments" />
                </span>
                <span>Q&A</span>
              </button>
            )}
            {user.hasPermission(permissions.MANAGE_ROOMS) && (
              <button
                className={`${style.button} button is-large ml-3`}
                type="button"
                onClick={handleRoomCreateClick}
              >
                <span className="icon">
                  <i className="fa fa-plus-square" />
                </span>
                <span>New Room</span>
              </button>
            )}
          </div>
        </div>
      )}
      {showRoomsManager && (
        <RoomsManager
          openDir={openDir}
          onBack={handleBackClick}
          accessRepo={accessRepo}
          chatRepo={chatRepo}
          chatClient={chatClient}
        />
      )}
    </div>
  );
}

export default RoomChannelListContainer;
