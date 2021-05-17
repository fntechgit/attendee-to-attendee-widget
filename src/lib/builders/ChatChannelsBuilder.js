// import { helpRoles, qaRoles } from '../../models/local_roles'

// export default class ChatChannelsBuilder {
//   static async _setUpChannel(channel, callback) {
//     const response = await channel.create()
//     await channel.watch()
//     await channel.show()
//     if (callback) callback(channel)
//     return channel
//   }

//   static async _setUpSupportChannel(supportRoles, type, callback) {
//     const filter = { type: 'messaging', id: { $eq: `${partnerId}-${type}` } }
//     const foundChannels = await client.queryChannels(filter, {}, {})

//     if (foundChannels.length > 0) {
//       const channel = foundChannels[0]
//       if (callback) callback(channel)
//       return channel
//     }
//     const supportUsers = await client.queryUsers({
//       local_role: { $in: supportRoles }
//     })
//     const channelUsers = supportUsers.users.map((u) => u.id)
//     channelUsers.push(partnerId)

//     const channel = client.channel('messaging', `${partnerId}-${type}`, {
//       name: `${partnerId}-${type}`,
//       members: channelUsers,
//       supporttype: type
//     })

//     return _setUpChannel(channel, setActiveChannel)
//   }

//   static async startConversation(
//     chatClient,
//     user,
//     partnerId,
//     setActiveChannel
//   ) {
//     const isHelpUser = helpRoles.includes(user.local_role)
//     const isQAUser = qaRoles.includes(user.local_role)

//     if (isHelpUser) {
//       return _setUpSupportChannel(helpRoles, 'help', setActiveChannel)
//     } else if (isQAUser) {
//       return _setUpSupportChannel(qaRoles, 'qa', setActiveChannel)
//     }
//     // get/create 1 to 1 channel
//     const filter = {
//       type: 'messaging',
//       id: { $in: [`${user.id}-${partnerId}`, `${partnerId}-${user.id}`] }
//     }
//     const foundChannels = await chatClient.queryChannels(filter, {}, {})

//     if (foundChannels.length > 0) {
//       const channel = foundChannels[0]
//       setActiveChannel(channel)
//       return channel
//     }
//     const channel = chatClient.channel('messaging', `${user.id}-${partnerId}`, {
//       name: `${user.id}-${partnerId}`,
//       members: [`${user.id}`, `${partnerId}`]
//     })
//     return _setUpChannel(channel, setActiveChannel)
//   }
// }
