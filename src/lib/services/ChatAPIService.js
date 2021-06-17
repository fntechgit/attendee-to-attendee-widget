export default class ChatAPIService {
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
  }
}
