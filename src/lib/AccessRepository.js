import { createClient } from '@supabase/supabase-js'
import { signIn, signUp } from './Auth'

export default class AccessRepository {
  constructor(supabaseUrl, supabaseKey) {
    this._client = createClient(supabaseUrl, supabaseKey)
    this._sbUser = null
  }

  async getAttendeeUser(attendeeProfile) {
    const { email, fullName, company, title, picUrl } = attendeeProfile

    const attFetchRes = await this._client
      .from('attendees')
      .select(`id`)
      .eq('email', email)

    if (attFetchRes.error) throw new Error(attFetchRes.error)

    if (attFetchRes.data && attFetchRes.data.length > 0 && !this._sbUser) {
      return await signIn(
        this._client,
        email,
        email
      )
    }

    return await signUp(
      this._client,
      email,
      fullName,
      email,
      company,
      title,
      picUrl
    )
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
      console.log(`AccessRepository::trackAccess summitId ${summitId} url ${url} fromIP ${fromIP} mustLogAccess ${mustLogAccess}`)
      if (!this._sbUser) {
        console.log(`AccessRepository::trackAccess this._sbUser is null`)
        this._sbUser = await this.getAttendeeUser(attendeeProfile)
      }

      if (!this._sbUser) throw new Error('User not found')

      //check existing access entry
      console.log(`AccessRepository::trackAccess querying supabase attendee_id ${this._sbUser.id}`);
      const fetchRes = await this._client
        .from('accesses')
        .select(`*, attendees(*)`)
        .match({ attendee_id: this._sbUser.id, summit_id: summitId })

      if (fetchRes.error) throw new Error(fetchRes.error)
      // there were a previous access from this user
      if (fetchRes.data && fetchRes.data.length > 0) {
        console.log(`AccessRepository::trackAccess data on 'accesses' already exists, updating it...`);
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
        if (error)
          throw new Error(error)
        if (mustLogAccess) {
          console.log(`AccessRepository::trackAccess logging access ...`);
          await this.logAccess(data[0])
        }
        return;
      }
      // no access so far ( first time)
      console.log(`AccessRepository::trackAccess first access from user ${this._sbUser.id}...`);
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

  subscribe(handleAccessNews) {
    return this._client
      .from(`accesses`)
      .on('INSERT', (payload) => handleAccessNews(payload.new))
      .on('UPDATE', (payload) => handleAccessNews(payload.new))
      .subscribe()
  }
}
