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

import { nameToId } from "../../utils/stringHelper";
import { channelTypes } from "../../models/channelTypes";
import { roles } from "../../models/userRoles";

export default class ChatRepository {
  constructor(supabaseService, streamChatService) {
    this._supabaseService = supabaseService;
    this._streamChatService = streamChatService;
  }

  async _getSupportAgents(summitId, eventId) {
    try {
      const { data, error } = await this._supabaseService
        .from("summit_attendee_roles")
        .select("idp_user_id")
        .eq("summit_id", summitId)
        .eq("summit_event_id", eventId);

      if (error) throw new Error(error);
      return data;
    } catch (error) {
      console.log("error", error);
      return [];
    }
  }

  async _getAgentInfo(summitId, id) {
    try {
      const { data, error } = await this._supabaseService
        .from("attendees_news")
        .select("*")
        .eq("idp_user_id", id)
        .eq("summit_id", summitId);
      if (error) throw new Error(error);
      return data[0];
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async initializeClient(
    user,
    accessRepo,
    chatApiBaseUrl,
    accessToken,
    summitId,
    needs2SyncChatAPI,
    callback,
    onError,
    onAuthError
  ) {
    const role = await accessRepo.getRole(user.id);
    user.role = role;

    await this._streamChatService.initializeClient(
      user,
      chatApiBaseUrl,
      accessToken,
      summitId,
      needs2SyncChatAPI,
      callback,
      onError,
      onAuthError
    );
  }

  async seedChannelTypes(
    chatApiBaseUrl,
    summitId,
    accessToken,
    needs2SyncChatAPI,
    callback,
    onError,
    onAuthError
  ) {
    await this._streamChatService.seedChannelTypes(
      chatApiBaseUrl,
      summitId,
      accessToken,
      needs2SyncChatAPI,
      callback,
      onError,
      onAuthError
    );
  }

  async uploadRoomImage(name, file) {
    const maxExpirationTime = 2147483647;
    try {
      const { uploadError } = await this._supabaseService.storage
        .from("chat-room-images")
        .upload(name, file);
      if (uploadError) throw new Error(uploadError);

      const { data, listError } = await this._supabaseService.storage
        .from("chat-room-images")
        .createSignedUrl(name, maxExpirationTime);

      if (listError) throw new Error(listError);

      return data;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async availableHelpAgents(summitId) {
    // Fetch all the show help agents from Supabase
    const helpAgents = await this._getSupportAgents(summitId, 0);
    return helpAgents && helpAgents.length > 0;
  }

  async availableQAAgents(summitId, eventId) {
    // Fetch all the activity QA agents from Supabase
    const qaAgents = await this._getSupportAgents(summitId, eventId);
    return qaAgents && qaAgents.length > 0;
  }

  async startHelpChat(user, summitId) {
    try {
      // Fetch all the show help agents from Supabase
      const helpAgents = await this._getSupportAgents(summitId, 0);
      if (helpAgents && helpAgents.length > 0) {
        const helpAgentIds = helpAgents.map((h) => h.idp_user_id.toString());
        const firstHelpAgent = await this._getAgentInfo(
          summitId,
          helpAgentIds[0]
        );
        if (!firstHelpAgent) {
          // console.log('could not find a help agent')
          return null;
        }
        const helpChannel = await this._streamChatService.createChannel(
          channelTypes.HELP_ROOM,
          `${user.id}-${roles.HELP}`,
          "Help Desk",
          "",
          [user.id],
          firstHelpAgent.pic_url,
          true
        );
        // Reset support agents
        const oldAgentMembers = await helpChannel.queryMembers({
          user_id: { $nin: [user.id] }
        });

        if (oldAgentMembers && oldAgentMembers.members.length > 0) {
          const oldAgentMemberIds = oldAgentMembers.members.map(
            (m) => m.user_id
          );
          await this._streamChatService.removeMembers(
            helpChannel,
            oldAgentMemberIds
          );
        }
        await this._streamChatService.addMembers(helpChannel, helpAgentIds);
        return helpChannel;
      }
    } catch (error) {
      console.log("error", error);
    }
    return null;
  }

  async startQAChat(user, summitId, activity) {
    try {
      // Fetch all the activity QA agents from Supabase
      const qaAgents = await this._getSupportAgents(summitId, activity.id);
      if (qaAgents && qaAgents.length > 0) {
        const qaAgentsIds = qaAgents.map((h) => h.idp_user_id.toString());
        const firstQAAgent = await this._getAgentInfo(summitId, qaAgentsIds[0]);
        if (!firstQAAgent) {
          // console.log('could not find a qa agent')
          return null;
        }
        const qaChannel = await this._streamChatService.createChannel(
          channelTypes.QA_ROOM,
          `${user.id}-${activity.id}`,
          "Q & A",
          activity.name,
          [user.id],
          firstQAAgent.pic_url,
          true
        );
        // Reset support agents
        const oldAgentMembers = await qaChannel.queryMembers({
          user_id: { $nin: [user.id] }
        });

        if (oldAgentMembers && oldAgentMembers.members.length > 0) {
          const oldAgentMemberIds = oldAgentMembers.members.map(
            (m) => m.user_id
          );
          await this._streamChatService.removeMembers(
            qaChannel,
            oldAgentMemberIds
          );
        }
        await this._streamChatService.addMembers(qaChannel, qaAgentsIds);
        return qaChannel;
      }
    } catch (error) {
      console.log("error", error);
    }
    return null;
  }

  async startA2AChat(user, partnerId) {
    try {
      const channel = await this._streamChatService.getChannel(
        channelTypes.MESSAGING,
        user,
        partnerId
      );
      if (channel) return channel;

      const id = `${user.id}-${partnerId}`;
      const members = [user.id, partnerId.toString()];
      return await this._streamChatService.createChannel(
        channelTypes.MESSAGING,
        id,
        id,
        "",
        members,
        user.picUrl,
        true
      );
    } catch (error) {
      console.log("error", error);
    }
    return null;
  }

  async getChannel(id) {
    return await this._streamChatService.getChannelById(id);
  }

  async deleteChannel(id) {
    await this._streamChatService.deleteChannel(id);
  }

  async removeMember(channel, memberId) {
    await this._streamChatService.removeMember(channel, memberId);
  }

  async createRoom(type, name, description, members, image) {
    try {
      const id = nameToId(name);
      return await this._streamChatService.createChannel(
        type,
        id,
        name,
        description,
        members,
        image,
        false
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async setUpActivityRoom(activity, user) {
    try {
      const { id, name, imgUrl } = activity;
      const channel = await this._streamChatService.createChannel(
        channelTypes.ACTIVITY_ROOM,
        id,
        name,
        name,
        null,
        imgUrl,
        false
      );
      if (channel) await channel.addMembers([user.idpUserId]);
    } catch (e) {
      console.error(e);
    }
  }

  async disconnect() {
    await this._streamChatService.disconnect();
  }
}
