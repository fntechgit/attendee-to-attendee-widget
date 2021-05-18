import { DateTime } from 'luxon'
import { signIn, signUp } from '../Auth'
import SupabaseClientBuilder from '../builders/SupabaseClientBuilder'

export default class AttendeeRepository {
  constructor(supabaseUrl, supabaseKey, user) {
    this._client = SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey)
    this._sbUser = null
    if (user) {
      this._fetchExistingAttendeeUser(user).then((u) => (this._sbUser = u))
    }
  }

  async _fetchExistingAttendeeUser(attendeeProfile) {
    const {
      email,
      fullName,
      company,
      title,
      picUrl,
      idpUserId,
      isOnline,
      socialInfo,
      badgeFeatures,
      bio
    } = attendeeProfile

    try {
      const attFetchRes = await this._client
        .from('attendees')
        .select(`*`)
        .eq('email', email)

      if (attFetchRes.error) throw new Error(attFetchRes.error)

      if (attFetchRes.data && attFetchRes.data.length > 0) {
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
            isOnline,
            socialInfo,
            badgeFeatures,
            bio
          )
        ) {
          //console.log('something change')
          this._updateAttendee(
            fetchedAttendee.id,
            fullName,
            company,
            title,
            picUrl,
            idpUserId,
            isOnline,
            socialInfo,
            badgeFeatures,
            bio
          )
        }
        return user
      }
      return null
    } catch (error) {
      console.log('error', error)
      return null
    }
  }

  async _initializeAttendeeUser(attendeeProfile) {
    const {
      email,
      fullName,
      company,
      title,
      picUrl,
      idpUserId,
      isOnline,
      socialInfo,
      badgeFeatures,
      bio
    } = attendeeProfile

    if (this._sbUser) return this._sbUser

    this._sbUser = await this._fetchExistingAttendeeUser(attendeeProfile)

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
      isOnline,
      socialInfo,
      badgeFeatures,
      bio
    )
    return newUser
  }

  _somethigChange(
    fetchedAttendee,
    fullName,
    company,
    title,
    picUrl,
    idpUserId,
    isOnline,
    socialInfo,
    badgeFeatures,
    bio
  ) {
    let sameBadgeFeatures = true
    if (fetchedAttendee.badges_info && badgeFeatures) {
      sameBadgeFeatures =
        fetchedAttendee.badges_info.length === badgeFeatures.length &&
        fetchedAttendee.badges_info.every(
          (value, index) => value === badgeFeatures[index]
        )
    }

    let sameSocialInfo = true
    if (fetchedAttendee.social_info && socialInfo) {
      sameSocialInfo =
        fetchedAttendee.social_info.github_user === socialInfo.githubUser &&
        fetchedAttendee.social_info.linked_in_profile ===
          socialInfo.linkedInProfile &&
        fetchedAttendee.social_info.twitter_name === socialInfo.twitterName &&
        fetchedAttendee.social_info.wechat_user === socialInfo.wechatUser
    }

    return (
      fetchedAttendee.full_name !== fullName ||
      fetchedAttendee.company !== company ||
      fetchedAttendee.title !== title ||
      fetchedAttendee.pic_url !== picUrl ||
      fetchedAttendee.idp_user_id !== idpUserId ||
      fetchedAttendee.is_online !== isOnline ||
      !sameSocialInfo ||
      !sameBadgeFeatures ||
      fetchedAttendee.bio !== bio
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
    isOnline,
    socialInfo,
    badgeFeatures,
    bio
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
        is_online: isOnline,
        social_info: socialInfo,
        badges_info: badgeFeatures,
        bio
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
    isOnline,
    socialInfo,
    badgeFeatures,
    bio
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
          is_online: isOnline,
          social_info: socialInfo,
          badges_info: badgeFeatures,
          bio
        }
      ])
      .eq('id', id)
    if (error) throw new Error(error)
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

  async findByFullName(filter) {
    try {
      const { data, error } = await this._client
        .from('attendees')
        .select(`*`)
        .ilike('full_name', `%${filter}%`)
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

  me() {
    return this._sbUser
  }
}
