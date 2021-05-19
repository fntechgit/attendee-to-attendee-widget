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
}
