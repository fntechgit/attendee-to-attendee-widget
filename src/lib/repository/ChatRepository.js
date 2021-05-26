import { nameToId } from '../../utils/stringHelper'
import { channelTypes } from '../../models/channel_types'

export default class ChatRepository {
  constructor(supabaseService, streamChatService, chatAPIService) {
    this._supabaseService = supabaseService
    this._streamChatService = streamChatService
    this._chatAPIService = chatAPIService
  }

  async initializeClient(
    apiBaseUrl,
    accessToken,
    forumSlug,
    callback,
    onAuthError
  ) {
    await this._streamChatService.initializeClient(
      apiBaseUrl,
      accessToken,
      forumSlug,
      callback,
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

  async createSupportChannel(user, partnerId) {
    return await this._streamChatService.createSupportChannel(user, partnerId)
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

  async setUpActivityRoom(name, imgUrl, user) {
    try {
      const id = nameToId(name)
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
