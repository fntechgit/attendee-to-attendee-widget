import AttendeeRepository from './attendeeRepository'

export default class AccessRepository extends AttendeeRepository {
  constructor(supabaseService, subscribeToRealtime, summitId) {
    super(supabaseService, null, summitId)
    this._newsListener = null
    if (subscribeToRealtime) this._subscribeToRealtime()
  }

  async _logAccess(accessEntry) {
    // console.log('_logAccess: ', accessEntry)
    const { error } = await this._client.from('access_tracking').insert([
      {
        atendee_news_id: accessEntry.id,
        summit_id: accessEntry.summit_id,
        url: accessEntry.current_url,
        attendee_ip: accessEntry.attendee_ip
      }
    ])

    if (error) {
      console.error(error)
      throw new Error(error)
    }
  }

  _subscribeToRealtime() {
    //const subscriptions = this._client.getSubscriptions()
    if (this._subscription && this._subscription.state === 'joined') {
      return
    }

    //resubscription
    this._unsubscribeFromRealtime()

    this._subscription = this._client
      .from('attendees_news')
      .on('INSERT', (payload) => this._handleRTSubscriptionNews(payload.new))
      .on('UPDATE', (payload) => this._handleRTSubscriptionNews(payload.new))
      .subscribe()
  }

  _unsubscribeFromRealtime() {
    if (this._subscription) this._client.removeSubscription(this._subscription)
  }

  _handleRTSubscriptionNews(news) {
    if (this._newsListener) {
      this._newsListener(news)
    }
  }

  sortByAttName(attendeesNews) {
    return attendeesNews
      .sort((a, b) => {
        let fa = a.full_name?.toLowerCase(),
          fb = b.full_name?.toLowerCase()
        if (fa < fb) return -1
        if (fa > fb) return 1
        return 0
      })
  }

  async trackAccess(attendeeProfile, url, fromIP, mustLogAccess) {
    try {
      attendeeProfile.isOnline = true

      if (
        !this._sbUser ||
        this._sbUser.email !== attendeeProfile.email ||
        this._sbUser.is_online !== attendeeProfile.isOnline
      ) {
        this._sbUser = await this._initializeAttendeeUser(attendeeProfile)
      }
      if (!this._sbUser) throw new Error('User not found')

      const { data, error } = await this._client
        .from('attendees_news')
        .update([
          {
            current_url: url,
            attendee_ip: fromIP
          }
        ])
        .eq('attendee_id', this._sbUser.id)
        .eq('summit_id', this._summitId)
      if (error) throw new Error(error)
      if (mustLogAccess) {
        await this._logAccess(data[0])
      }
      return
    } catch (error) {
      console.error('error', error)
    }
  }

  cleanUpAccess() {
    try {
      if (this._sbUser) {
        this.signOut()
        return this._client
          .from('attendees_news')
          .update([{ current_url: '', attendee_ip: '' }])
          .match({ attendee_id: this._sbUser.id, summit_id: this._summitId })
      }
    } catch (error) {
      console.error('error', error)
    }
  }

  mergeChanges(attendeesListLocal, attendeesNews, url) {
    let oldItem = null
    let res = null

    const oldItemVerOccurrences = attendeesListLocal.filter(
      (item) => item.id === attendeesNews.id
    )
    //already exists locally
    if (oldItemVerOccurrences.length > 0) {
      //console.log('merge with an existing element')
      oldItem = oldItemVerOccurrences[0]
      oldItem.notification_status = attendeesNews.notification_status

      res = attendeesListLocal.filter((item) => item.id !== attendeesNews.id)

      if (attendeesNews.is_online) {
        res.unshift(oldItem)
        if (url && attendeesNews.current_url === url) {
          oldItem.current_url = attendeesNews.current_url
        }
      }
    } else {
      //console.log('merge with a new element')
      res = [...attendeesListLocal]
      res.unshift(attendeesNews)
    }

    return this.sortByAttName(
      res.filter(
        (v, i, a) => a.findIndex((t) => t.attendee_id === v.attendee_id) === i
      )
    )
  }

  subscribe(listener) {
    this._newsListener = listener
  }

  disconnect() {
    console.log('unsubscribing from real time...')
    this._unsubscribeFromRealtime()
  }
}
