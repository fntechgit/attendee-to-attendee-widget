/* eslint-disable no-undef */
import { StreamChat } from 'stream-chat'

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

  seedChannelTypes = async (
    apiBaseUrl,
    summitId,
    accessToken,
    callback,
    onAuthError
  ) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }

    fetch(
      `${apiBaseUrl}/api/v1/channel-types/seed?access_token=${accessToken}&summit_id=${summitId}`,
      requestOptions
    ).then(async (response) => {
      const res = await response.json()
      if (response.status === 200) {
        callback(res)
      } else {
        onAuthError(res, response)
      }
    })
  }
}
