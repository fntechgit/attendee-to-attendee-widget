import { signIn, signUp } from '../auth'
import { roles } from '../../models/userRoles'

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
        .from('attendees')
        .select(`*`)
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
            fetchedAttendee.id,
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
      allowChatWithMe
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
    allowChatWithMe
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
        bio,
        public_profile_show_email: showEmail,
        public_profile_allow_chat_with_me: allowChatWithMe
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
    bio,
    showEmail,
    allowChatWithMe
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
          bio,
          public_profile_show_email: showEmail,
          public_profile_allow_chat_with_me: allowChatWithMe
        }
      ])
      .eq('id', id)
    if (error) throw new Error(error)
  }

  async findByIdpID(id) {
    try {
      const { data, error } = await this._client
        .from('attendees')
        .select('*')
        .eq('idp_user_id', id)
      if (error) throw new Error(error)
      return data[0]
    } catch (error) {
      console.log('error', error)
    }
  }

  async findByFullName(filter) {
    try {
      const { data, error } = await this._client
        .from('attendees')
        .select('*')
        .ilike('full_name', `%${filter}%`)
      if (error) throw new Error(error)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  async getRole(idpUserId) {
    try {
      const { data, error } = await this._client
        .from('summit_attendee_roles')
        .select('summit_id, summit_event_id')
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
          .from('attendees')
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
