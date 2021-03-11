import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { signIn, signUp, signOut } from './Auth'

export default class AccessRepository {
  constructor(supabaseUrl, supabaseKey) {
    this._client = createClient(supabaseUrl, supabaseKey)
    this._sbUser = null
  }

  async _addAttendee(
    id,
    fullName,
    email,
    company,
    title,
    picUrl,
    idpUserId,
    isOnline
  ) {
    let { error } = await this._client.from('attendees').insert([
      {
        id,
        full_name: fullName,
        email,
        company,
        title,
        pic_url: picUrl,
        idp_user_id: idpUserId,
        is_online: isOnline
      }
    ])

    if (error) throw new Error(error)
  }

  async _updateAttendee(
    id,
    fullName,
    company,
    title,
    picUrl,
    idpUserId,
    isOnline
  ) {
    let { error } = await this._client
      .from('attendees')
      .update([
        {
          full_name: fullName,
          company,
          title,
          pic_url: picUrl,
          idp_user_id: idpUserId,
          is_online: isOnline
        }
      ])
      .eq('id', id)
    if (error) throw new Error(error)
  }

  _somethigChange(
    fetchedAttendee,
    fullName,
    company,
    title,
    picUrl,
    idpUserId,
    isOnline
  ) {
    return (
      fetchedAttendee.full_name !== fullName ||
      fetchedAttendee.company !== company ||
      fetchedAttendee.title !== title ||
      fetchedAttendee.pic_url !== picUrl ||
      fetchedAttendee.idp_user_id !== idpUserId ||
      fetchedAttendee.is_online !== isOnline
    )
  }

  async _initializeAttendeeUser(attendeeProfile) {
    const {
      email,
      fullName,
      company,
      title,
      picUrl,
      idpUserId,
      isOnline
    } = attendeeProfile

    const attFetchRes = await this._client
      .from('attendees')
      .select(`*`)
      .eq('email', email)

    if (attFetchRes.error) throw new Error(attFetchRes.error)

    if (attFetchRes.data && attFetchRes.data.length > 0 && !this._sbUser) {
      const fetchedAttendee = attFetchRes.data[0]
      const user = await signIn(this._client, email, email)
      if (
        this._somethigChange(
          fetchedAttendee,
          fullName,
          company,
          title,
          picUrl,
          idpUserId,
          isOnline
        )
      ) {
        console.log('something change')
        this._updateAttendee(
          fetchedAttendee.id,
          fullName,
          company,
          title,
          picUrl,
          idpUserId,
          isOnline
        )
      }
      return user
    }

    if (this._sbUser) return this._sbUser
    
    const newUser = await signUp(this._client, email, email)
    await this._addAttendee(
      newUser.id,
      fullName,
      email,
      company,
      title,
      picUrl,
      idpUserId,
      isOnline
    )
    return newUser
  }

  async _logAccess(accessEntry) {
    //console.log('_logAccess: ', accessEntry)
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

  async fetchCurrentPageAttendees(url, pageIx = 0, pageSize = 6, ageMinutesBackward = 5) {
    try {
      const ageTreshold = DateTime.utc().minus({ minutes: ageMinutesBackward }).toString()
      const lowerIx = pageIx * pageSize
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize)
      let { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq('current_url', url)
        .eq('attendees.is_online', true)
        .gt('updated_at', ageTreshold)
        .order('updated_at', { ascending: false })
        .range(lowerIx, upperIx)
      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  async fetchCurrentShowAttendees(summitId, pageIx = 0, pageSize = 6, ageMinutesBackward = 5) {
    try {
      const ageTreshold = DateTime.utc().minus({ minutes: ageMinutesBackward }).toString()
      const lowerIx = pageIx * pageSize
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize)

      let { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq('summit_id', summitId)
        .eq('attendees.is_online', true)
        .gt('updated_at', ageTreshold)
        .order('updated_at', { ascending: false })
        .range(lowerIx, upperIx)
      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  async findByFullName(filter, summitId, url) {
    try {
      const { scopeFieldName, scopeFieldVal } = url
        ? { scopeFieldName: 'current_url', scopeFieldVal: url }
        : { scopeFieldName: 'summit_id', scopeFieldVal: summitId }

      const { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq(scopeFieldName, scopeFieldVal)
        .ilike('attendees.full_name', `%${filter}%`)
      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
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

      //check existing access entry
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

  signOut() {
    try {
      if (this._sbUser) {
        //await signOut(this._client)
        return this._client
          .from('attendees')
          .update([{ is_online: false }])
          .match({ id: this._sbUser.id })
          .then((data) => {
            console.log(data)
          })
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  async mergeChanges(attendeesListLocal, attendeesNews, url) {
    let oldItem = null
    let oldItemVerOccurrences = attendeesListLocal.filter(
      (item) => item.id === attendeesNews.id
    )
    if (oldItemVerOccurrences.length > 0) {
      oldItem = oldItemVerOccurrences[0]

      const newList = attendeesListLocal.filter(
        (item) => item.id !== attendeesNews.id
      )
      if (attendeesNews.current_url === url) {
        oldItem.current_url = attendeesNews.current_url
        newList.unshift(oldItem)
      }
      return newList
    } else {
      //must fetch from api
      let { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq('id', attendeesNews.id)

      if (!error && data && data.length > 0) {
        const item = data[0]
        if (item.current_url === url) {
          attendeesListLocal.unshift(item)
        }
        return [...attendeesListLocal]
      }
    }
    return null
  }

  subscribe(handleAccessNews) {
    return this._client
      .from(`accesses`)
      .on('INSERT', (payload) => handleAccessNews(payload.new))
      .on('UPDATE', (payload) => handleAccessNews(payload.new))
      .subscribe()
  }
}
