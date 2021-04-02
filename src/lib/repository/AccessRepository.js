import AttendeeRepository from './AttendeeRepository'

export default class AccessRepository extends AttendeeRepository {

  constructor(supabaseUrl, supabaseKey) {
    super(supabaseUrl, supabaseKey, null)
  }

  async _logAccess(accessEntry) {
    // console.log('_logAccess: ', accessEntry)
    const { error } = await this._client.from('access_tracking').insert([
      {
        access_id: accessEntry.id,
        summit_id: accessEntry.summit_id,
        url: accessEntry.current_url,
        attendee_ip: accessEntry.attendee_ip
      }
    ])

    if (error) {
      console.log(error)
      throw new Error(error)
    }
  }

  async trackAccess(attendeeProfile, summitId, url, fromIP, mustLogAccess) {
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

      // check existing access entry
      const fetchRes = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .match({ attendee_id: this._sbUser.id, summit_id: summitId })

      if (fetchRes.error) throw new Error(fetchRes.error)
      // there were a previous access from this user
      if (fetchRes.data && fetchRes.data.length > 0) {
        const access = fetchRes.data[0]
        const { data, error } = await this._client
          .from('accesses')
          .update([
            {
              current_url: url,
              attendee_ip: fromIP
            }
          ])
          .eq('id', access.id)
        if (error) throw new Error(error)
        if (mustLogAccess) {
          await this._logAccess(data[0])
        }
        return
      }
      // no access so far (first time)
      const insRes = await this._client.from('accesses').insert([
        {
          attendee_id: this._sbUser.id,
          summit_id: summitId,
          current_url: url,
          attendee_ip: fromIP
        }
      ])
      if (insRes.error) throw new Error(insRes.error)
      if (mustLogAccess) await this._logAccess(insRes.data[0])
    } catch (error) {
      console.log('error', error)
    }
  }

  async findByAttendeeId(attendeeId, summitId) {
    try {
      const { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq('summit_id', summitId)
        .eq('attendee_id', attendeeId)
      if (error) throw new Error(error)
      return data[0]
    } catch (error) {
      console.log('error', error)
    }
  }

  cleanUpAccess(summitId) {
    try {
      if (this._sbUser) {
        this.signOut()
        return this._client
          .from('accesses')
          .update([{ current_url: '', attendee_ip: '' }])
          .match({ attendee_id: this._sbUser.id, summit_id: summitId })
      }
    } catch (error) {
      console.log('error', error)
    }
  }
  
  async mergeChanges(attendeesListLocal, attendeesNews, url) {
    const mustCheckURL = arguments.length > 2
    let oldItem = null

    const oldItemVerOccurrences = attendeesListLocal.filter(
      (item) => item.id === attendeesNews.id
    )
    if (oldItemVerOccurrences.length > 0) {
      oldItem = oldItemVerOccurrences[0]
      oldItem.notification_status = attendeesNews.notification_status

      const newList = attendeesListLocal.filter(
        (item) => item.id !== attendeesNews.id
      )
      if (mustCheckURL) {
        if (attendeesNews.current_url === url) {
          oldItem.current_url = attendeesNews.current_url
          newList.unshift(oldItem)
        }
      } else {
        newList.unshift(oldItem)
      }
      return newList
    } else {
      // must fetch from api
      const { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq('id', attendeesNews.id)

      if (!error && data && data.length > 0) {
        const item = data[0]
        if (!mustCheckURL || item.current_url === url) {
          attendeesListLocal.unshift(item)
        }
        return [...attendeesListLocal]
      }
    }
    return null
  }

  subscribe(handleAccessNews) {
    if (this._subscription) this._client.removeSubscription(this._subscription)
    this._subscription = this._client
      .from(`accesses`)
      .on('INSERT', (payload) => handleAccessNews(payload.new))
      .on('UPDATE', (payload) => handleAccessNews(payload.new))
      .subscribe()
  }
}