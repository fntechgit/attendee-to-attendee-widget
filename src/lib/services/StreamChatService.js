/* eslint-disable no-undef */
import { StreamChat } from 'stream-chat'
import { channelTypes } from '../../models/channel_types'
import { helpRoles, qaRoles } from '../../models/local_roles'

export default class StreamChatService {
  constructor(streamApiKey) {
    this.chatClient = new StreamChat(streamApiKey)
    this.flag = `${streamApiKey}_chat`
  }

  initializeClient = async (
    apiBaseUrl,
    accessToken,
    forumSlug,
    callback,
    onAuthError
  ) => {
    fetch(
      `${apiBaseUrl}/api/v1/sso/stream-chat/${forumSlug}/profile?access_token=${accessToken}`
    ).then(async (response) => {
      const streamServerInfo = await response.json()

      if (response.status === 200) {
        localStorage.setItem(this.flag, JSON.stringify(streamServerInfo))

        this.chatClient.setUser(
          {
            id: streamServerInfo.id,
            name: streamServerInfo.name,
            image: streamServerInfo.image,
            local_role: streamServerInfo.local_role
          },
          streamServerInfo.token
        )

        callback(this.chatClient, { ...streamServerInfo })
      } else {
        onAuthError(streamServerInfo, response)
      }
    })
  }

  getClient = () => {
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

  static async getChannel(chatClient, type, user, partnerId) {
    const filter = {
      type: type,
      id: { $in: [`${user.id}-${partnerId}`, `${partnerId}-${user.id}`] }
    }
    const foundChannels = await chatClient.queryChannels(filter, {}, {})
    if (foundChannels.length > 0) {
      return foundChannels[0]
    }
    return null
  }

  static async createChannel(
    chatClient,
    type,
    name,
    description,
    members,
    image
  ) {
    const channel = chatClient.channel(type, name, {
      name: name,
      image: image,
      members: members
    })

    //await channel.addModerators([]);

    //await channel.create()
    await channel.watch()
    await channel.show()

    return channel
  }

  static async createSupportChannel(chatClient, user, type) {
    console.log('viene', type)

    const roles = type === channelTypes.QA_ROOM ? qaRoles : helpRoles
    const supportType = type === channelTypes.QA_ROOM ? 'qa' : 'help'
    const displaySupportType =
      type === channelTypes.QA_ROOM ? 'Q & A' : 'Help Desk'

    const supportUsers = await chatClient.queryUsers({
      local_role: { $in: roles }
    })

    if (supportUsers.users.length > 0) {
      const channelUsers = supportUsers.users.map((u) => u.id)
      channelUsers.push(user.id)
      const imageURL = supportUsers.users[0].image

      const channel = chatClient.channel(type, `${user.id}-${supportType}`, {
        //name: `${user.id}-${supportType}`,
        name: displaySupportType,
        members: channelUsers,
        image: imageURL,
        supporttype: supportType
      })

      const response = await channel.create()

      const membersInChannel = response.members.map((m) => m.user.id)

      const membersToRemove = response.members
        .filter((m) => !roles.includes(m.user.local_role) && m.role !== 'owner')
        .map((u) => u.user.id)

      if (membersToRemove.length > 0) {
        await channel.removeMembers(membersToRemove)
      }

      if (channelUsers.some((mid) => !membersInChannel.includes(mid))) {
        await channel.addMembers(channelUsers)
      }

      await channel.watch()
      await channel.show()

      return channel
    }
    return null
  }

  static async deleteChannel(chatClient, id) {
    // const filter = { type: channelTypes.CUSTOM_ROOM, id: id }
    const filter = { id: id }
    const channels = await chatClient.queryChannels(filter, {}, {})
    if (channels && channels.length > 0) {
      await channels[0].delete()
    }
  }

  static async removeMember(channel, memberId) {
    if (channel) {
      await channel.removeMembers([memberId])
      const remainingMembers = await channel.queryMembers({})
      if (remainingMembers.members.length == 0) {
        channel.delete()
      }
    }
  }
}
