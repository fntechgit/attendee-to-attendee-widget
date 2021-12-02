import { DateTime } from 'luxon'
import { signIn, signUp } from '../auth'
import { roles } from '../../models/userRoles'

const ATTTENDEES_SELECT_PROJ =
  'attendee_id, full_name, email, company, title, pic_url, bio, idp_user_id, is_online, social_info, badges_info, public_profile_show_email, public_profile_allow_chat_with_me'

const DEFAULT_PAGE_SIZE = 30

export const DEFAULT_MIN_BACKWARD = 15

export default class AttendeeRepository {
  constructor(supabaseService, user) {
    this._client = supabaseService
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
      getBadgeFeatures,
      bio,
      showEmail,
      allowChatWithMe
    } = attendeeProfile

    try {
      const attFetchRes = await this._client
        .from('attendees_news')
        .select(ATTTENDEES_SELECT_PROJ)
        .eq('email', email)

      if (attFetchRes.error) throw new Error(attFetchRes.error)

      if (attFetchRes.data && attFetchRes.data.length > 0) {
        const fetchedAttendee = attFetchRes.data[0]

        const user = await signIn(this._client, email, email)

        const badgeFeatures = getBadgeFeatures()

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
            bio,
            showEmail,
            allowChatWithMe
          )
        ) {
          //console.log('something change')
          this._updateAttendee(
            fetchedAttendee.attendee_id,
            fullName,
            company,
            title,
            picUrl,
            idpUserId,
            isOnline,
            socialInfo,
            badgeFeatures,
            bio,
            showEmail,
            allowChatWithMe
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

  async _initializeAttendeeUser(attendeeProfile, summitId) {
    const {
      email,
      fullName,
      company,
      title,
      picUrl,
      idpUserId,
      isOnline,
      socialInfo,
      getBadgeFeatures,
      bio,
      showEmail,
      allowChatWithMe
    } = attendeeProfile

    if (this._sbUser) return this._sbUser

    this._sbUser = await this._fetchExistingAttendeeUser(attendeeProfile)

    if (this._sbUser) return this._sbUser

    const newUser = await signUp(this._client, email, email)

    const badgeFeatures = getBadgeFeatures()

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
      bio,
      showEmail,
      allowChatWithMe,
      summitId
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
    bio,
    showEmail,
    allowChatWithMe
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
      fetchedAttendee.bio !== bio ||
      fetchedAttendee.public_profile_show_email !== showEmail ||
      fetchedAttendee.public_profile_allow_chat_with_me !== allowChatWithMe
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
    bio,
    showEmail,
    allowChatWithMe,
    summitId
  ) {
    const { error } = await this._client.from('attendees_news').insert([
      {
        attendee_id: id,
        summit_id: summitId,
        full_name: fullName && fullName != 'null' ? fullName : 'Private',
        email,
        company,
        title,
        pic_url: picUrl,
        idp_user_id: idpUserId,
        is_online: isOnline,
        social_info: socialInfo,
        badges_info: badgeFeatures,
        bio,
        public_profile_show_email: showEmail,
        public_profile_allow_chat_with_me: allowChatWithMe,
        current_url: '',
        attendee_ip: ''
      }
    ])

    if (error) {
      console.log('_addAttendee', error)
      throw new Error(error)
    }
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
    bio,
    showEmail,
    allowChatWithMe
  ) {
    const { error } = await this._client
      .from('attendees_news')
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
          bio,
          public_profile_show_email: showEmail,
          public_profile_allow_chat_with_me: allowChatWithMe
        }
      ])
      .eq('attendee_id', id)
    if (error) throw new Error(error)
  }

  async findByNameOrCompany(
    filter,
    summitId,
    url,
    ageMinutesBackward = DEFAULT_MIN_BACKWARD
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

  async fetchCurrentPageAttendees(
    url,
    pageIx = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    ageMinutesBackward = DEFAULT_MIN_BACKWARD
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString()

      const lowerIx = pageIx * pageSize
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize)
      const { data, error } = await this._client
        .from('attendees_news')
        .select('*')
        .eq('current_url', url)
        .eq('is_online', true)
        .gt('updated_at', ageTreshold)
        //.order('updated_at', { ascending: false })
        .range(lowerIx, upperIx)

      if (error) throw new Error(error)
      return this._sortAccessesByAttName(data)
    } catch (error) {
      console.error('error', error)
    }
  }

  async fetchCurrentShowAttendees(
    summitId,
    pageIx = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    ageMinutesBackward = DEFAULT_MIN_BACKWARD
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString()
      const lowerIx = pageIx * pageSize
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize)

      const { data, error } = await this._client
        .from('attendees_news')
        .select('*')
        .eq('summit_id', summitId)
        .eq('is_online', true)
        .neq('full_name', null)
        .gt('updated_at', ageTreshold)
        //.order('updated_at', { ascending: false })
        .range(lowerIx, upperIx)
      if (error) throw new Error(error)

      //console.log('fetchCurrentShowAttendees access news', data)
      //console.log('fetchCurrentShowAttendees attendees', data.map(d => d.attendees).length)
      return this._sortAccessesByAttName(data)
    } catch (error) {
      console.error('error', error)
    }
  }

  async getRole(idpUserId, summitId) {
    try {
      const { data, error } = await this._client
        .from('summit_attendee_roles')
        .select('summit_id, summit_event_id')
        .eq('summit_id', summitId)
        .eq('idp_user_id', idpUserId)
      if (error) throw new Error(error)
      if (data.length === 0) return roles.USER
      const roleItem = data[0]
      if (roleItem.summit_event_id > 0) return roles.QA
      return roles.HELP
    } catch (error) {
      console.log('error', error)
      return null
    }
  }

  signOut() {
    try {
      if (this._sbUser) {
        // await signOut(this._client)
        return this._client
          .from('attendees_news')
          .update([{ is_online: false }])
          .match({ id: this._sbUser.id })
          .then((data) => {
            //console.log(data)
            this._sbUser = null
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
