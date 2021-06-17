import { nameToId } from '../../utils/stringHelper'
import { channelTypes } from '../../models/channelTypes'
import { roles } from '../../models/userRoles'

export default class ChatRepository {
  constructor(supabaseService, streamChatService, chatAPIService) {
    this._supabaseService = supabaseService
    this._streamChatService = streamChatService
    this._chatAPIService = chatAPIService
  }

  async _getSupportAgents(summitId, eventId) {
    try {
      const { data, error } = await this._supabaseService
        .from('summit_attendee_roles')
        .select('idp_user_id')
        .eq('summit_id', summitId)
        .eq('summit_event_id', eventId)

      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
      return []
    }
  }

  async _getAgentInfo(id) {
    try {
      const { data, error } = await this._supabaseService
        .from('attendees')
        .select('*')
        .eq('idp_user_id', id)
      if (error) throw new Error(error)
      return data[0]
    } catch (error) {
      console.log('error', error)
      return null
    }
  }

  async initializeClient(
    user,
    accessRepo,
    chatApiBaseUrl,
    accessToken,
    summitId,
    callback,
    onError,
    onAuthError
  ) {
    const role = await accessRepo.getRole(user.id)
    user.role = role
    await this._streamChatService.initializeClient(
      user,
      chatApiBaseUrl,
      accessToken,
      summitId,
      callback,
      onError,
      onAuthError
    )
  }

  async seedChannelTypes(
    chatApiBaseUrl,
    summitId,
    accessToken,
    callback,
    onAuthError
  ) {
    await this._chatAPIService.seedChannelTypes(
      chatApiBaseUrl,
      summitId,
      accessToken,
      callback,
      onAuthError
    )
  }

  async uploadRoomImage(name, file) {
    const maxExpirationTime = 2147483647
    try {
      const { uploadError } = await this._supabaseService.storage
        .from('chat-room-images')
        .upload(name, file)
      if (uploadError) throw new Error(uploadError)

      const { data, listError } = await this._supabaseService.storage
        .from('chat-room-images')
        .createSignedUrl(name, maxExpirationTime)

      if (listError) throw new Error(listError)

      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  async startHelpChat(user, summitId) {
    try {
      //Fetch all the show help agents from Supabase
      const helpAgents = await this._getSupportAgents(summitId, 0)
      if (helpAgents && helpAgents.length > 0) {
        const helpAgentIds = helpAgents.map((h) => h.idp_user_id.toString())
        const firstHelpAgent = await this._getAgentInfo(helpAgentIds[0])
        const members = [user.id, ...helpAgentIds]
        return await this._streamChatService.createChannel(
          channelTypes.HELP_ROOM,
          `${user.id}-${roles.HELP}`,
          'Help Desk',
          '',
          members,
          firstHelpAgent.pic_url
        )
      }
    } catch (error) {
      console.log('error', error)
    }
    return null
  }

  async startQAChat(user, summitId, activity) {
    try {
      //Fetch all the activity QA agents from Supabase
      const qaAgents = await this._getSupportAgents(summitId, activity.id)
      if (qaAgents && qaAgents.length > 0) {
        const qaAgentsIds = qaAgents.map((h) => h.idp_user_id.toString())
        const firstQAAgent = await this._getAgentInfo(qaAgentsIds[0])
        const members = [user.id, ...qaAgentsIds]
        return await this._streamChatService.createChannel(
          channelTypes.QA_ROOM,
          `${user.id}-${activity.id}`,
          'Q & A',
          activity.name,
          members,
          firstQAAgent.pic_url
        )
      }
    } catch (error) {
      console.log('error', error)
    }
    return null
  }

  async startA2AChat(user, partnerId) {
    try {
      const channel = await this._streamChatService.getChannel(
        channelTypes.MESSAGING,
        user,
        partnerId
      )
      if (channel) return channel
      const id = `${user.id}-${partnerId}`
      const members = [user.id, partnerId]
      return await this._streamChatService.createChannel(
        channelTypes.MESSAGING,
        id,
        id,
        '',
        members,
        user.picUrl
      )
    } catch (error) {
      console.log('error', error)
    }
    return null
  }

  async getChannel(id) {
    return await this._streamChatService.getChannelById(id)
  }

  async deleteChannel(id) {
    await this._streamChatService.deleteChannel(id)
  }

  async removeMember(channel, memberId) {
    await this._streamChatService.removeMember(channel, memberId)
  }

  async createRoom(type, name, description, members, image) {
    try {
      const id = nameToId(name)
      return await this._streamChatService.createChannel(
        type,
        id,
        name,
        description,
        members,
        image
      )
    } catch (error) {
      console.log('error', error)
    }
  }

  async setUpActivityRoom(activity, user) {
    try {
      const { id, name, imgUrl } = activity
      const channel = await this._streamChatService.createChannel(
        channelTypes.ACTIVITY_ROOM,
        id,
        name,
        name,
        null,
        imgUrl
      )
      if (channel) await channel.addMembers([user.idpUserId])
    } catch (e) {
      console.error(e)
    }
  }
}
