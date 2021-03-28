import { DateTime } from 'luxon'
import { signIn, signUp } from '../Auth'
import SupabaseClientBuilder from '../builders/SupabaseClientBuilder'

export default class AttendeeRepository {
  constructor(supabaseUrl, supabaseKey) {
    this._client = SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey)
    this._sbUser = null
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
    const { error } = await this._client.from('attendees').insert([
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
    const { error } = await this._client
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

  async fetchCurrentPageAttendees(
    url,
    pageIx = 0,
    pageSize = 6,
    ageMinutesBackward = 5
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString()
      const lowerIx = pageIx * pageSize
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize)
      const { data, error } = await this._client
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

  async fetchCurrentShowAttendees(
    summitId,
    pageIx = 0,
    pageSize = 6,
    ageMinutesBackward = 5
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString()
      const lowerIx = pageIx * pageSize
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize)

      const { data, error } = await this._client
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

  signOut() {
    try {
      if (this._sbUser) {
        // await signOut(this._client)
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
}
