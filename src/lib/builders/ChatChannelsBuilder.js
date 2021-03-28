import { helpRoles, qaRoles } from '../../models/local_roles'

export default class ChatChannelsBuilder {
  createSupportChannel = async (chatClient, user, type) => {
    const roles = type === 'qa' ? qaRoles : helpRoles

    const supportUsers = await chatClient.queryUsers({
      local_role: { $in: roles }
    })

    if (supportUsers.users.length > 0) {
      const channelUsers = supportUsers.users.map((u) => u.id)
      channelUsers.push(user.id)

      const channel = chatClient.channel('messaging', `${user.id}-${type}`, {
        name: `${user.id}-${type}`,
        members: channelUsers,
        supporttype: type
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

  async startConversation(partnerId, client, user, setActiveChannel) {
    let result
    // const isHelpUser = helpRoles.includes(user.local_role)
    // const isQAUser = qaRoles.includes(user.local_role)

    // if (isHelpUser) {
    //   // show help channel
    //   const filter = { type: 'messaging', id: { $eq: `${partnerId}-help` } }
    //   const foundChannels = await client.queryChannels(filter, {}, {})

    //   if (foundChannels.length > 0) {
    //     setActiveChannel(foundChannels[0])
    //   } else {
    //     const helpUsers = await client.queryUsers({
    //       local_role: { $in: helpRoles }
    //     })
    //     const channelUsers = helpUsers.users.map((u) => u.id)
    //     channelUsers.push(partnerId)

    //     const channel = client.channel('messaging', `${partnerId}-help`, {
    //       name: `${partnerId}-help`,
    //       members: channelUsers
    //     })

    //     const response = await channel.create()
    //     await channel.watch()
    //     await channel.show()
    //     setActiveChannel(channel)
    //   }
    // } else if (isQAUser) {
    //   // show qa channel
    //   const filter = { type: 'messaging', id: { $eq: `${partnerId}-qa` } }
    //   const foundChannels = await client.queryChannels(filter, {}, {})

    //   if (foundChannels.length > 0) {
    //     setActiveChannel(foundChannels[0])
    //   } else {
    //     const qaUsers = await client.queryUsers({
    //       local_role: { $in: qaRoles }
    //     })
    //     const channelUsers = qaUsers.users.map((u) => u.id)
    //     channelUsers.push(partnerId)

    //     const channel = client.channel('messaging', `${partnerId}-qa`, {
    //       name: `${partnerId}-qa`,
    //       members: channelUsers
    //     })

    //     const response = await channel.create()
    //     await channel.watch()
    //     await channel.show()
    //     setActiveChannel(channel)
    //   }
    // } else {
    // create 1 to 1 channel
    const filter = {
      type: 'messaging',
      id: { $in: [`${user.id}-${partnerId}`, `${partnerId}-${user.id}`] }
    }
    const foundChannels = await client.queryChannels(filter, {}, {})

    if (foundChannels.length > 0) {
      setActiveChannel(foundChannels[0])
      result = foundChannels[0]
    } else {

      const channel = client.channel('messaging', `${user.id}-${partnerId}`, {
        name: `${user.id}-${partnerId}`,
        members: [`${user.id}`, `${partnerId}`]
      })

      const response = await channel.create()
      await channel.watch()
      await channel.show()
      setActiveChannel(channel)
      result = channel
    }
    // }
    return result
  }

  static async getChannel(partnerId, client, user) {
    const filter = {
      type: 'messaging',
      id: { $in: [`${user.id}-${partnerId}`, `${partnerId}-${user.id}`] }
    }
    const foundChannels = await client.queryChannels(filter, {}, {})
    if (foundChannels.length > 0) {
      return foundChannels[0]
    }
    return null
  }
}
