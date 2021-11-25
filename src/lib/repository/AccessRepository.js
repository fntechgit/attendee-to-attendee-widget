import { DateTime } from 'luxon'
import AttendeeRepository from './attendeeRepository'

export default class AccessRepository extends AttendeeRepository {
  constructor(supabaseService, subscribeToRealtime) {
    super(supabaseService, null)
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

  _sortAccessesByAttName(accesses) {
    return accesses
      .filter((d) => d.full_name)
      .sort((a, b) => {
        let fa = a.full_name.toLowerCase(),
          fb = b.full_name.toLowerCase()
        if (fa < fb) return -1
        if (fa > fb) return 1
        return 0
      })
  }

  async trackAccess(attendeeProfile, summitId, url, fromIP, mustLogAccess) {
    try {
      attendeeProfile.isOnline = true

      if (
        !this._sbUser ||
        this._sbUser.email !== attendeeProfile.email ||
        this._sbUser.is_online !== attendeeProfile.isOnline
      ) {
        this._sbUser = await this._initializeAttendeeUser(
          attendeeProfile,
          summitId
        )
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
        .eq('summit_id', summitId)
      if (error) throw new Error(error)
      if (mustLogAccess) {
        await this._logAccess(data[0])
      }
      return
    } catch (error) {
      console.error('error', error)
    }
  }

  async findByAttendeeId(attendeeId, summitId) {
    try {
      const { data, error } = await this._client
        .from('attendees_news')
        .select('*')
        .eq('summit_id', summitId)
        .eq('attendee_id', attendeeId)
      if (error) throw new Error(error)
      return data[0]
    } catch (error) {
      console.error('error', error)
    }
  }

  async findByAttendeeNameOrCompany(
    filter,
    summitId,
    url,
    ageMinutesBackward = default_min_backward
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString()
      const { scopeFieldName, scopeFieldVal } = url
        ? { scopeFieldName: 'current_url', scopeFieldVal: url }
        : { scopeFieldName: 'summit_id', scopeFieldVal: summitId }

      const byNameRes = await this._client
        .from('attendees_news')
        .select('*')
        .eq(scopeFieldName, scopeFieldVal)
        .eq('is_online', true)
        .gt('updated_at', ageTreshold)
        .ilike('full_name', `%${filter}%`)
      if (byNameRes.error) throw new Error(byNameRes.error)

      const byCompanyRes = await this._client
        .from('attendees_news')
        .select('*')
        .eq(scopeFieldName, scopeFieldVal)
        .eq('is_online', true)
        .gt('updated_at', ageTreshold)
        .ilike('company', `%${filter}%`)
      if (byCompanyRes.error) throw new Error(byCompanyRes.error)

      const attByName = byNameRes.data.filter((el) => el)
      const attByCompany = byCompanyRes.data.filter((el) => el)

      const seen = new Set()
      const res = [...attByName, ...attByCompany].filter((el) => {
        const duplicate = seen.has(el.id)
        seen.add(el.id)
        return !duplicate
      })
      return res
    } catch (error) {
      console.error('error', error)
      return []
    }
  }

  cleanUpAccess(summitId) {
    try {
      if (this._sbUser) {
        this.signOut()
        return this._client
          .from('attendees_news')
          .update([{ current_url: '', attendee_ip: '' }])
          .match({ attendee_id: this._sbUser.id, summit_id: summitId })
      }
    } catch (error) {
      console.error('error', error)
    }
  }

  async mergeChanges(summitId, attendeesListLocal, attendeesNews, url) {
    let oldItem = null
    //console.log('merging access news...')

    const oldItemVerOccurrences = attendeesListLocal.filter(
      (item) => item.id === attendeesNews.id
    )
    if (oldItemVerOccurrences.length > 0) {
      //console.log('merge')

      oldItem = oldItemVerOccurrences[0]
      oldItem.notification_status = attendeesNews.notification_status

      const newList = attendeesListLocal.filter(
        (item) => item.id !== attendeesNews.id
      )
      if (url && attendeesNews.current_url === url) {
        oldItem.current_url = attendeesNews.current_url
      }
      newList.unshift(oldItem)

      const res = newList.filter(
        (v, i, a) => a.findIndex((t) => t.attendee_id === v.attendee_id) === i
      )
      return this._sortAccessesByAttName(res)
    } else {
      // must fetch from api
      //console.log('merge fetching from api')
      
      const { data, error } = await this._client
        .from('attendees_news')
        .select('*')
        .eq('summit_id', summitId)
        .eq('id', attendeesNews.id)

      if (!error && data && data.length > 0) {
        const item = data[0]
        if (!url || item.current_url === url) {
          attendeesListLocal.unshift(item)
        }
        const res = [
          ...attendeesListLocal.filter(
            (v, i, a) =>
              a.findIndex((t) => t.attendee_id === v.attendee_id) === i
          )
        ]
        return this._sortAccessesByAttName(res)
      }
      return attendeesListLocal
    }
  }

  subscribe(listener) {
    this._newsListener = listener
  }

  disconnect() {
    console.log('unsubscribing from real time...')
    _unsubscribeFromRealtime()
  }
}
