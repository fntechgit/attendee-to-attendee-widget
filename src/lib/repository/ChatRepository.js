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

  mergeChatNews(attendeesNews, chatNotifications) {
    //console.log('chatNotifications', chatNotifications)
    if (!chatNotifications) return attendeesNews
    attendeesNews.forEach((attendeeNews) => {
      //console.log('attendeeNews.attendee_id in chatNotifications', attendeeNews.attendee_id in chatNotifications)
      if (attendeeNews.attendee_id in chatNotifications) {
        attendeeNews.has_new_message = true
      }
    })
    return attendeesNews
  }

  subscribe(handleNotificationsNews) {
    this._subscription = this._client
      .from(`message_notifications`)
      .on('INSERT', (payload) => handleNotificationsNews(payload.new))
      .on('UPDATE', (payload) => handleNotificationsNews(payload.new))
      .subscribe()
  }

  unsubscribe() {
    this._client.removeSubscription(this._subscription)
  }
}
