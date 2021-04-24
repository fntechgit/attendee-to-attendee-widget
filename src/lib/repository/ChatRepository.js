import AttendeeRepository from './AttendeeRepository'

export default class ChatRepository extends AttendeeRepository {
  async notifyNewMessage(targetAttendeeIDPId, summitId, message) {
    try {
      // get target attendee
      const { error, data } = await this._client
        .from('attendees')
        .select(`id`)
        .match({ idp_user_id: targetAttendeeIDPId })

      if (error) throw new Error(error)

      const insRes = await this._client.from('message_notifications').insert(
        [
          {
            from_attendee_id: this._sbUser.id,
            to_attendee_id: data[0].id,
            summit_id: summitId,
            last_message: message,
            status: 'UNREAD'
          }
        ],
        { upsert: true }
      )
      if (insRes.error) throw new Error(insRes.error)
    } catch (error) {
      console.log('error', error)
    }
  }

  async engage(targetAttendeeIDPId, summitId) {
    try {
      // get target attendee
      const { error, data } = await this._client
        .from('attendees')
        .select(`id`)
        .match({ idp_user_id: targetAttendeeIDPId })

      if (error) throw new Error(error)

      const insRes = await this._client
        .from('message_notifications')
        .update([
          {
            status: 'READ'
          }
        ])
        .eq('from_attendee_id', data[0].id)
        .eq('to_attendee_id', this._sbUser.id)
        .eq('summit_id', summitId)
      if (insRes.error) throw new Error(insRes.error)
    } catch (error) {
      console.log('error', error)
    }
  }

  chatNotificationsToMap(chatNotifications) {
    if (!chatNotifications) return {}
    return chatNotifications.reduce((map, obj) => {
      map[obj.from_attendee_id] = obj.status
      return map
    }, {})
  }

  syncChatNotificationsMap(
    chatNotificationsMap,
    attendeeId,
    notificationStatus
  ) {
    const currentAttendeeUserId = this._sbUser ? this._sbUser.id : null
    chatNotificationsMap[attendeeId] =
      attendeeId !== currentAttendeeUserId ? notificationStatus : undefined
    return chatNotificationsMap
  }

  mergeChatNews(attendeesNews, chatNotificationsMap) {
    const currentAttendeeUserId = this._sbUser ? this._sbUser.id : null
    if (!chatNotificationsMap || Object.keys(chatNotificationsMap).length === 0) {
      attendeesNews.forEach((attendeeNews) => {
        if (attendeeNews.attendee_id === currentAttendeeUserId) {
          attendeeNews.notification_status = undefined
        }
      })
      return attendeesNews
    }

    attendeesNews.forEach((attendeeNews) => {
      if (attendeeNews.attendee_id in chatNotificationsMap) {
        attendeeNews.notification_status =
          attendeeNews.attendee_id !== currentAttendeeUserId
            ? chatNotificationsMap[attendeeNews.attendee_id]
            : undefined
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
