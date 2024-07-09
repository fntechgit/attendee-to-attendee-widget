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
import {
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator
} from "stream-chat-react";
import DirectMessageChannelPreview from "../ChannelPreview/DirectMessageChannelPreview";
import RoomChannelPreview from "../ChannelPreview/RoomChannelPreview";
import { channelTypes } from "../../../models/channelTypes";

import style from "./style.module.scss";

function CustomEmptyStateIndicator(isRoomChatChannel) {
  if (isRoomChatChannel) {
    return <div />;
  }
  return <div className={style.noChannels}>No active conversations</div>;
}

function ChannelListContainer({
  user,
  chatClient,
  onItemClick,
  onDelete,
  isRoomChatChannel,
  filters,
  sort,
  options
}) {
  if (!chatClient) {
    return <LoadingIndicator />;
  }

  return (
    <div className={style.channelsListWrapper}>
      <ChannelList
        key="channel-list-users"
        filters={filters}
        options={options}
        sort={sort}
        List={ChannelListMessenger}
        Preview={(previewProps) => {
          const { type } = previewProps.channel;
          return type === channelTypes.MESSAGING ||
            type === channelTypes.HELP_ROOM ||
            type === channelTypes.QA_ROOM ? (
            <DirectMessageChannelPreview
              {...previewProps}
              onItemClick={onItemClick}
            />
          ) : (
            <RoomChannelPreview
              user={user}
              {...previewProps}
              onItemClick={onItemClick}
              onDelete={onDelete}
            />
          );
        }}
        EmptyStateIndicator={() => (
          <CustomEmptyStateIndicator isRoomChatChannel={isRoomChatChannel} />
        )}
        // LoadingIndicator={CustomLoadingIndicator}
        setActiveChannelOnMount={false}
        me={user}
      />
    </div>
  );
}

export default ChannelListContainer;
