import AttendeeRepository from './AttendeeRepository'

export default class ChatRepository extends AttendeeRepository {
  async notifyNewMessage(attendeeProfile, targetAttendeeIDPId, summitId, message) {
    try {
      // get target attendee
      const {error, data} = await this._client
        .from('attendees')
        .select(`id`)
        .match({ idp_user_id: targetAttendeeIDPId })

      if (error) throw new Error(error)

      if (!this._sbUser) {
        this._sbUser = await this._initializeAttendeeUser(attendeeProfile)
      }

      const insRes = await this._client.from('message_notifications').insert([
        {
          from_attendee_id: this._sbUser.id,
          to_attendee_id: data[0].id,
          summit_id: summitId,
          last_message: message
        }
      ])
      if (insRes.error) throw new Error(insRes.error)
    } catch (error) {
      console.log('error', error)
    }
  }

  chatNotificationsToMap(chatNotifications) {
    return chatNotifications.reduce((map, obj) => {
        map[obj.from_attendee_id] = obj.status;
        return map;
    }, {});
  }

  mergeChatNews(attendeesNews, chatNotificationsMap) {
    if (!chatNotificationsMap || chatNotificationsMap.length === 0) return attendeesNews
    attendeesNews.forEach((attendeeNews) => {
      if (attendeeNews.attendee_id in chatNotificationsMap) {
        attendeeNews.notification_status = chatNotificationsMap[attendeeNews.attendee_id]
      }
    })
    return attendeesNews
  }

  async fetchChatNotifications(summitId) {
    try {
      const { data, error } = await this._client
        .from('message_notifications')
        .select(`from_attendee_id, last_message, status`)
        .eq('summit_id', summitId)
      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  subscribe(handleNotificationsNews) {
    if (this._subscription) this._client.removeSubscription(this._subscription)
    this._subscription = this._client
      .from(`message_notifications`)
      .on('INSERT', (payload) => handleNotificationsNews(payload.new))
      .on('UPDATE', (payload) => handleNotificationsNews(payload.new))
      .subscribe()
  }
}
