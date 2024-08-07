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

/* eslint-disable react/jsx-boolean-value */
import React, { useEffect, useState } from "react";
import {
  Channel,
  Chat,
  LoadingIndicator,
  MessageInput,
  MessageList,
  Thread,
  Window,
  withChatContext
} from "stream-chat-react";
import SimpleChannelHeader from "../CustomChannelHeader/SimpleChannelHeader";
import CustomRoomChannelHeader from "../CustomChannelHeader/CustomRoomChannelHeader";
import { channelTypes } from "../../../models/channelTypes";
import { roles } from "../../../models/userRoles";

import style from "./style.module.scss";

function ConversationBox({
  chatCounterpart,
  chatClient,
  chatRepo,
  activeChannel,
  user,
  openDir,
  setActiveChannel,
  onClose,
  visible,
  summitId,
  activity,
  onChatMenuSelected,
  onChatStartError
}) {
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initChannel = async () => {
      // console.log('activeChannel', activeChannel)
      if (!activeChannel) {
        if (chatCounterpart === roles.QA) {
          if (activity) {
            const qaChannel = await chatRepo.startQAChat(
              user,
              summitId,
              activity
            );
            if (qaChannel) {
              setChannel(qaChannel);
            } else if (onChatStartError) {
              onChatStartError("Q&A is not available right now");
            }
          }
        } else if (chatCounterpart === roles.HELP) {
          if (user.role !== roles.HELP) {
            const helpChannel = await chatRepo.startHelpChat(user, summitId);
            if (helpChannel) {
              setChannel(helpChannel);
            } else if (onChatStartError) {
              onChatStartError("Help Desk is not available right now");
            }
          }
        } else {
          const dmChannel = await chatRepo.startA2AChat(user, chatCounterpart);
          if (dmChannel) setChannel(dmChannel);
        }
      } else {
        setChannel(activeChannel);
      }
      setIsLoading(false);
    };
    // console.log('initChannel', visible)
    if (visible) initChannel();
  }, [chatCounterpart, visible]);

  const handleClose = (ev) => {
    ev.preventDefault();
    setActiveChannel(null);
    setChannel(null);
    setIsLoading(false);
    onClose();
  };

  const getChanTypeByCounterpart = (counterpart) => {
    switch (counterpart) {
      case roles.HELP:
        return channelTypes.HELP_ROOM;
      case roles.QA:
        return channelTypes.QA_ROOM;
      default:
        return channelTypes.MESSAGING;
    }
  };

  const buildChannelHeader = () => {
    const channelType = activeChannel
      ? activeChannel.type
      : getChanTypeByCounterpart(chatCounterpart);

    if (
      channelType === channelTypes.QA_ROOM ||
      channelType === channelTypes.HELP_ROOM ||
      channelType === channelTypes.MESSAGING
    ) {
      return (
        <SimpleChannelHeader
          me={chatClient.user}
          channel={channel}
          onClose={handleClose}
        />
      );
    }
    return (
      <CustomRoomChannelHeader
        me={chatClient.user}
        channel={channel}
        onClose={handleClose}
        onMenuSelected={onChatMenuSelected}
      />
    );
  };

  const getMessageActions = () => {
    const channelType = activeChannel
      ? activeChannel.type
      : getChanTypeByCounterpart(chatCounterpart);

    return channelType === channelTypes.MESSAGING
      ? ["flag", "pin", "quote", "react", "reply"]
      : ["flag", "pin", "react", "reply"];
  };

  if (isLoading) {
    return (
      <div className={`${style.conversation} ${style[openDir]}`}>
        <LoadingIndicator size={35} />
      </div>
    );
  }

  return (
    channel && (
      <div className={`${style.conversation} ${style[openDir]}`}>
        <Chat
          client={chatClient}
          theme="messaging light"
          initialNavOpen={false}
        >
          <Channel channel={channel}>
            <Window hideOnThread={true}>
              {buildChannelHeader()}
              <MessageList
                client={chatClient}
                messageActions={getMessageActions()}
                closeThread={console.log}
              />
              <MessageInput focus />
            </Window>
            <Thread fullWidth />
          </Channel>
        </Chat>
      </div>
    )
  );
}

export default withChatContext(ConversationBox);
