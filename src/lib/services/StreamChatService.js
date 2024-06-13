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
 **/

/* eslint-disable no-undef */
import { StreamChat } from 'stream-chat'

export default class StreamChatService {
  constructor(streamApiKey) {
    this.chatClient = new StreamChat(streamApiKey)
    this.flag = `${streamApiKey}_chat`
  }

  initializeClient = async (
    user,
    chatApiBaseUrl,
    accessToken,
    summitId,
    callback,
    onError,
    onAuthError
  ) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (chatApiBaseUrl) {
      fetch(
        `${chatApiBaseUrl}/api/v1/sso?access_token=${accessToken}&summit_id=${summitId}`,
        requestOptions
      ).then(async (response) => {
        const streamServerInfo = await response.json()

        if (response.status === 200 || response.status === 201) {
          localStorage.setItem(this.flag, JSON.stringify(streamServerInfo))
          try {
            await this.chatClient.disconnectUser()
            this.chatClient.connectUser(
              {
                id: streamServerInfo.id,
                name: streamServerInfo.name,
                image: streamServerInfo.image,
                local_role: user.role //local_role: streamServerInfo.role
              },
              streamServerInfo.token
            )
            callback(this.chatClient, { ...streamServerInfo })
          } catch (e) {
            onError(e)
          }
        } else {
          onAuthError(streamServerInfo, response)
        }
      })
    } else {
      console.log('Test mode - chat api disconnected')
      callback(this.chatClient, {})
    }
  }

  seedChannelTypes = async (
    chatApiBaseUrl,
    summitId,
    accessToken,
    callback,
    onAuthError
  ) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }

    if (chatApiBaseUrl) {
      fetch(
        `${chatApiBaseUrl}/api/v1/channel-types/seed?access_token=${accessToken}&summit_id=${summitId}`,
        requestOptions
      ).then(async (response) => {
        const res = await response.json()
        if (response.status === 200) {
          callback(res)
        } else {
          onAuthError(res, response)
        }
      })
    } else {
      console.log('Test mode - chat api disconnected')
      callback(null)
    }
  }

  getClient() {
    const streamServerInfo = JSON.parse(localStorage.getItem(this.flag))

    this.chatClient.connectUser(
      {
        id: streamServerInfo.id,
        name: streamServerInfo.name,
        image: streamServerInfo.image
      },
      streamServerInfo.token
    )

    return { chatClient: this.chatClient, user: { ...streamServerInfo } }
  }

  async getChannel(type, user, partnerId) {
    const filter = {
      type: type,
      id: { $in: [`${user.id}-${partnerId}`, `${partnerId}-${user.id}`] }
    }
    const foundChannels = await this.chatClient.queryChannels(filter, {}, {})
    if (foundChannels.length > 0) {
      return foundChannels[0]
    }
    return null
  }

  async getChannelById(id) {
    const filter = { id: { $in: [`${id}`] } }
    const foundChannels = await this.chatClient.queryChannels(filter, {}, {})
    if (foundChannels.length > 0) {
      return foundChannels[0]
    }
    return null
  }

  async createChannel(type, id, name, description, members, image, watch) {
    const channel = this.chatClient.channel(type, id, {
      name: name,
      image: image,
      description: description,
      members: members
    })
    if (watch) {
      await channel.watch()
      await channel.show()
    } else {
      await channel.create()
    }
    return channel
  }

  async deleteChannel(id) {
    const filter = { id: `${id}` }
    const channels = await this.chatClient.queryChannels(filter, {}, {})

    if (channels && channels.length > 0) {
      await channels[0].delete()
    }
  }

  async addMembers(channel, memberIds) {
    if (channel) {
      await channel.addMembers(memberIds)
    }
  }

  async removeMembers(channel, memberIds) {
    if (channel) {
      await channel.removeMembers(memberIds)
    }
  }

  async removeMember(channel, memberId) {
    if (channel) {
      await channel.removeMembers([memberId])
      const remainingMembers = await channel.queryMembers({})
      if (remainingMembers.members.length == 0) {
        channel.delete()
      }
    }
  }

  async disconnect() {
    await this.chatClient?.disconnectUser()
  }
}
