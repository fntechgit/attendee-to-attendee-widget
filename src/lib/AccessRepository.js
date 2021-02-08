import { createClient } from '@supabase/supabase-js'
import { signIn, signUp } from './Auth'

export default class AccessRepository {
  constructor(supabaseUrl, supabaseKey) {
    this._client = createClient(supabaseUrl, supabaseKey)
    this._sbUser = null
  }

  async addAttendee(id, fullName, email, company, title, picUrl, idpUserId) {
    let { error } = await this._client
      .from('attendees')
      .insert([
        {
          id,
          full_name: fullName,
          email,
          company,
          title,
          pic_url: picUrl,
          idp_user_id: idpUserId
        }
      ])

    if (error) throw new Error(error)
  }

  async updateAttendee(id, fullName, company, title, picUrl, idpUserId) {
    let { error } = await this._client
      .from('attendees')
      .update([
        {
          full_name: fullName,
          company,
          title,
          pic_url: picUrl,
          idp_user_id: idpUserId
        }
      ])
      .eq('id', id)

    if (error) throw new Error(error)
  }

  somethigChange(fetchedAttendee, fullName, company, title, picUrl, idpUserId) {
    return (
      fetchedAttendee.full_name !== fullName ||
      fetchedAttendee.company !== company ||
      fetchedAttendee.title !== title ||
      fetchedAttendee.pic_url !== picUrl ||
      fetchedAttendee.idp_user_id !== idpUserId
    )
  }

  async getAttendeeUser(attendeeProfile) {
    const {
      email,
      fullName,
      company,
      title,
      picUrl,
      idpUserId
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
        this.somethigChange(
          fetchedAttendee,
          fullName,
          company,
          title,
          picUrl,
          idpUserId
        )
      ) {
        console.log('something change')
        this.updateAttendee(
          fetchedAttendee.id,
          fullName,
          company,
          title,
          picUrl,
          idpUserId
        )
      }
      return user
    }

    const newUser = await signUp(this._client, email, email)
    await addAttendee(
      newUser.id,
      fullName,
      email,
      company,
      title,
      picUrl,
      idpUserId
    )
    return newUser
  }

  async fetchCurrentPageAttendees(url) {
    try {
      let { data, error } = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .eq('current_url', url)
      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  async logAccess(accessEntry) {
    //console.log('logAccess: ', accessEntry)
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
      if (!this._sbUser) {
        this._sbUser = await this.getAttendeeUser(attendeeProfile)
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
          await this.logAccess(data[0])
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
      if (mustLogAccess) await this.logAccess(insRes.data[0])
    } catch (error) {
      console.log('error', error)
    }
  }

  cleanUpAccess(summitId) {
    try {
      if (this._sbUser) {
        this._client
          .from('accesses')
          .update([
            {
              current_url: '',
              attendee_ip: ''
            }
          ])
          .match({ attendee_id: this._sbUser.id, summit_id: summitId }
        )
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  subscribe(handleAccessNews) {
    return this._client
      .from(`accesses`)
      .on('INSERT', (payload) => handleAccessNews(payload.new))
      .on('UPDATE', (payload) => handleAccessNews(payload.new))
      .subscribe()
  }
}
