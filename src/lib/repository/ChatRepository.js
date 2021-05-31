import { nameToId } from '../../utils/stringHelper'
import { channelTypes } from '../../models/channelTypes'

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

  async initializeClient(
    user,
    accessRepo,
    apiBaseUrl,
    accessToken,
    forumSlug,
    callback,
    onError,
    onAuthError
  ) {
    const role = await accessRepo.getRole(user.id)
    user.role = role
    await this._streamChatService.initializeClient(
      user,
      apiBaseUrl,
      accessToken,
      forumSlug,
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

  async createSupportChannel(user, activity, type) {
    return await this._streamChatService.createSupportChannel(
      user,
      activity,
      type
    )
  }

  async createHelpChannel(user, summitId) {
    //Fetch all the show help agents from Supabase
    const helpAgents = await this._getSupportAgents(summitId, 0)
    if (helpAgents && helpAgents.length > 0) {
      const helpAgentIds = helpAgents.map((h) => h.idp_user_id.toString())
      const members = [user.id, ...helpAgentIds]
      console.log('help channel members', members)
    }
    //Create/get the HELP channel with id (user.id-help)

    //Add fetched agents to the channel
    //Add user to the channel
    //Return the channel
  }

  async createQAChannel(user, summitId, activity) {
    //Fetch all the activity QA agents from Supabase
    const qaAgents = await this._getSupportAgents(summitId, activity.id)
    if (qaAgents && qaAgents.length > 0) {
      const qaAgentsIds = qaAgents.map((h) => h.idp_user_id.toString())
      const members = [user.id, ...qaAgentsIds]
      console.log('qa channel members', members)
    }
    //Create/get the QA channel with id (user.id-activity.id)
    //Add fetched agents to the channel
    //Add user to the channel
    //Return the channel
  }

  async createChannel(type, name, description, members, image) {
    try {
      const id = nameToId(name)
      return this._streamChatService.createChannel(
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

  async getChannel(type, user, partnerId) {
    await this._streamChatService.getChannel(type, user, partnerId)
  }

  async deleteChannel(id) {
    await this._streamChatService.deleteChannel(id)
  }

  async removeMember(channel, memberId) {
    await this._streamChatService.removeMember(channel, memberId)
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
      if (channel) channel.addMembers([user.idpUserId])
    } catch (e) {
      console.error(e)
    }
  }
}
