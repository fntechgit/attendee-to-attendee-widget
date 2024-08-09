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

/* eslint-disable no-undef */
import { StreamChat } from "stream-chat";
import { HTTP_200, HTTP_201 } from "../constants";

export default class StreamChatService {
  constructor(streamApiKey) {
    this.chatClient = new StreamChat(streamApiKey);
    this.flag = `${streamApiKey}_chat`;
  }

  connectChatUser = async (user, streamServerInfo, onSuccess, onError) => {
    try {
      await this.chatClient.disconnectUser();
      this.chatClient.connectUser(
        {
          id: streamServerInfo.id,
          name: streamServerInfo.name,
          image: streamServerInfo.image,
          local_role: user.role // local_role: streamServerInfo.role
        },
        streamServerInfo.token
      );
      onSuccess(this.chatClient, { ...streamServerInfo });
    } catch (e) {
      onError(e);
    }
  };

  initializeClient = async (
    user,
    chatApiBaseUrl,
    accessToken,
    summitId,
    syncChatAPI,
    onSuccess,
    onError,
    onAuthError
  ) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    };

    if (!chatApiBaseUrl) {
      console.log("Test mode - chat api disconnected");
      onSuccess(this.chatClient, {});
      return;
    }

    if (!syncChatAPI) {
      const savedStreamServerInfo = JSON.parse(localStorage.getItem(this.flag));
      await this.connectChatUser(
        user,
        savedStreamServerInfo,
        onSuccess,
        onError
      );
    } else {
      fetch(
        `${chatApiBaseUrl}/api/v1/sso?access_token=${accessToken}&summit_id=${summitId}`,
        requestOptions
      )
        .then(async (response) => {
          const streamServerInfo = await response.json();

          if (response.status === HTTP_200 || response.status === HTTP_201) {
            localStorage.setItem(this.flag, JSON.stringify(streamServerInfo));
            await this.connectChatUser(
              user,
              streamServerInfo,
              onSuccess,
              onError
            );
          } else {
            onAuthError(streamServerInfo, response);
          }
        })
        .catch((error) => {
          onError(error);
        });
    }
  };

  seedChannelTypes = async (
    chatApiBaseUrl,
    summitId,
    accessToken,
    syncChatAPI,
    onSuccess,
    onError,
    onAuthError
  ) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    };

    if (!chatApiBaseUrl) {
      console.log("Test mode - chat api disconnected");
      onSuccess(null);
      return;
    }

    if (!syncChatAPI) {
      onSuccess(null);
      return;
    }

    fetch(
      `${chatApiBaseUrl}/api/v1/channel-types/seed?access_token=${accessToken}&summit_id=${summitId}`,
      requestOptions
    )
      .then(async (response) => {
        const res = await response.json();
        if (response.status === HTTP_200 || response.status === HTTP_201) {
          onSuccess(res);
        } else {
          onAuthError(res, response);
        }
      })
      .catch((error) => {
        onError(error);
      });
  };

  getClient() {
    const streamServerInfo = JSON.parse(localStorage.getItem(this.flag));

    this.chatClient.connectUser(
      {
        id: streamServerInfo.id,
        name: streamServerInfo.name,
        image: streamServerInfo.image
      },
      streamServerInfo.token
    );

    return { chatClient: this.chatClient, user: { ...streamServerInfo } };
  }

  async getChannel(type, user, partnerId) {
    const filter = {
      type,
      id: { $in: [`${user.id}-${partnerId}`, `${partnerId}-${user.id}`] }
    };
    const foundChannels = await this.chatClient.queryChannels(filter, {}, {});
    if (foundChannels.length > 0) {
      return foundChannels[0];
    }
    return null;
  }

  async getChannelById(id) {
    const filter = { id: { $in: [`${id}`] } };
    const foundChannels = await this.chatClient.queryChannels(filter, {}, {});
    if (foundChannels.length > 0) {
      return foundChannels[0];
    }
    return null;
  }

  async createChannel(type, id, name, description, members, image, watch) {
    const channel = this.chatClient.channel(type, id, {
      name,
      image,
      description,
      members
    });
    if (watch) {
      await channel.watch();
      await channel.show();
    } else {
      await channel.create();
    }
    return channel;
  }

  async deleteChannel(id) {
    const filter = { id: `${id}` };
    const channels = await this.chatClient.queryChannels(filter, {}, {});

    if (channels && channels.length > 0) {
      await channels[0].delete();
    }
  }

  async addMembers(channel, memberIds) {
    if (channel) {
      await channel.addMembers(memberIds);
    }
  }

  async removeMembers(channel, memberIds) {
    if (channel) {
      await channel.removeMembers(memberIds);
    }
  }

  async removeMember(channel, memberId) {
    if (channel) {
      await channel.removeMembers([memberId]);
      const remainingMembers = await channel.queryMembers({});
      if (remainingMembers.members.length === 0) {
        channel.delete();
      }
    }
  }

  async disconnect() {
    await this.chatClient?.disconnectUser();
  }
}
