/* eslint-disable no-undef */
import { StreamChat } from 'stream-chat'

export default class StreamChatService {
  constructor(streamApiKey) {
    this.chatClient = new StreamChat(streamApiKey)
    this.flag = `${streamApiKey}_chat`
  }

  initializeClient = async (
    user,
    apiBaseUrl,
    accessToken,
    forumSlug,
    callback,
    onError,
    onAuthError
  ) => {
    fetch(
      `${apiBaseUrl}/api/v1/sso/stream-chat/${forumSlug}/profile?access_token=${accessToken}`
    ).then(async (response) => {
      const streamServerInfo = await response.json()

      if (response.status === 200) {
        localStorage.setItem(this.flag, JSON.stringify(streamServerInfo))
        try {
          await this.chatClient.disconnect()
          this.chatClient.setUser(
            {
              id: streamServerInfo.id,
              name: streamServerInfo.name,
              image: streamServerInfo.image,
              local_role: user.role //local_role: streamServerInfo.local_role
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
  }

  getClient() {
    const streamServerInfo = JSON.parse(localStorage.getItem(this.flag))

    this.chatClient.setUser(
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
    const filter = { id: { $in: [id] } }
    const foundChannels = await this.chatClient.queryChannels(filter, {}, {})
    if (foundChannels.length > 0) {
      return foundChannels[0]
    }
    return null
  }

  async createChannel(type, id, name, description, members, image) {
    const channel = this.chatClient.channel(type, id, {
      name: name,
      image: image,
      description: description,
      members: members
    })
    await channel.watch()
    await channel.show()
    return channel
  }

  async deleteChannel(id) {
    // const filter = { type: channelTypes.CUSTOM_ROOM, id: id }
    const filter = { id: id }
    const channels = await this.chatClient.queryChannels(filter, {}, {})
    if (channels && channels.length > 0) {
      await channels[0].delete()
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
}
