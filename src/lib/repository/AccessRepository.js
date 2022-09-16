import AttendeeRepository from './attendeeRepository'
import { CHANNEL_STATES } from '../../lib/constants'

export default class AccessRepository extends AttendeeRepository {
  constructor(supabaseService, subscribeToRealtime, summitId) {
    super(supabaseService, null, summitId)
    this._newsListener = null
    if (subscribeToRealtime) this.refreshRealtimeSubscription()
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

  _handleRTSubscriptionNews(news) {
    if (this._newsListener) {
      this._newsListener(news)
    }
  }
  
  _isJoined() {
    return this._subscription?.state === CHANNEL_STATES.joined
  }
  
  _isJoining() {
    return this._subscription?.state === CHANNEL_STATES.joining
  }

  refreshRealtimeSubscription() {
    //const subscriptions = this._client.getSubscriptions()
    if (this._isJoined() || this._isJoining()) return

    console.log('A2A::AccessRepository::refreshRealtimeSubscription - re-subscribing to realtime...', this._subscription?.state)

    if (this._subscription) this._client.removeSubscription(this._subscription)

    this._subscription = this._client
      .from('attendees_news')
      .on('INSERT', (payload) => this._handleRTSubscriptionNews(payload.new))
      .on('UPDATE', (payload) => this._handleRTSubscriptionNews(payload.new))
      .subscribe()

    //console.log('subscriptions count', this._client.getSubscriptions()?.length)
    console.log('A2A::AccessRepository::refreshRealtimeSubscription - re-subscribed to realtime...', this._subscription?.state)
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
      console.error('A2A::AccessRepository::trackAccess - error', error)
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
      console.error('A2A::AccessRepository::cleanUpAccess - error', error)
    }
  }

  mergeChanges(attendeesListLocal, attendeesNews) {
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

  filterSameURLAttendees(attendeesList, url) {
    return attendeesList.filter(a => a.current_url === url)
  }

  subscribe(listener) {
    this._newsListener = listener
  }
}
