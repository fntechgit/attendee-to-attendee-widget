/**
 * Copyright 2021 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import { DateTime } from "luxon";
import { signIn, signUp } from "../Auth";
import { roles } from "../../models/userRoles";

const ATTTENDEES_SELECT_PROJ = `
  attendee_id, 
  full_name, 
  email, 
  company, 
  title, 
  pic_url, 
  bio, 
  idp_user_id, 
  is_online, 
  social_info, 
  badges_info, 
  public_profile_show_email, 
  public_profile_show_full_name, 
  public_profile_allow_chat_with_me, 
  public_profile_show_photo, 
  public_profile_show_social_media_info,
  public_profile_show_bio
`;

const DEFAULT_PAGE_SIZE = 30;

const ANONYMOUS_USER_NAME = "Anonymous";
const ANONYMOUS_USER_EMAIL = "anonymous@nomail.com";

export const DEFAULT_MIN_BACKWARD = 15;

export default class AttendeeRepository {
  constructor(supabaseService, user, summitId) {
    this._summitId = summitId;
    this._client = supabaseService;
    this._sbUser = null;
    if (user) {
      this._fetchExistingAttendeeUser(user).then((u) => {
        this._sbUser = u;
      });
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
      showFullName,
      allowChatWithMe,
      showProfilePic,
      showSocialInfo,
      showBio
    } = attendeeProfile;

    const fetchedAttendee = await this._get(idpUserId);
    if (!fetchedAttendee) return null;

    try {
      const user = await signIn(this._client, email, email);

      const badgeFeatures = getBadgeFeatures();

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
          showFullName,
          allowChatWithMe,
          showProfilePic,
          showSocialInfo,
          showBio
        )
      ) {
        // console.log('something change')
        this._updateAttendee(
          fetchedAttendee.attendee_id,
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
          showFullName,
          allowChatWithMe,
          showProfilePic,
          showSocialInfo,
          showBio
        );
      }
      return user;
    } catch (error) {
      console.log("error", error);
      return null;
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
      showFullName,
      allowChatWithMe,
      showProfilePic,
      showSocialInfo,
      showBio
    } = attendeeProfile;

    if (this._sbUser) return this._sbUser;

    this._sbUser = await this._fetchExistingAttendeeUser(attendeeProfile);

    if (this._sbUser) return this._sbUser;

    const newUser = await signUp(this._client, email, email);

    const badgeFeatures = getBadgeFeatures();

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
      showFullName,
      allowChatWithMe,
      showProfilePic,
      showSocialInfo,
      showBio
    );
    return newUser;
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
    showFullName,
    allowChatWithMe,
    showProfilePic,
    showSocialInfo,
    showBio
  ) {
    let sameBadgeFeatures = true;
    if (badgeFeatures && fetchedAttendee.badges_info) {
      sameBadgeFeatures =
        fetchedAttendee.badges_info.length === badgeFeatures.length &&
        fetchedAttendee.badges_info.every(
          (value, index) =>
            JSON.stringify(value) === JSON.stringify(badgeFeatures[index])
        );
    }

    let sameSocialInfo = true;
    if (socialInfo && fetchedAttendee.social_info) {
      sameSocialInfo =
        fetchedAttendee.social_info.githubUser === socialInfo.githubUser &&
        fetchedAttendee.social_info.linkedInProfile ===
          socialInfo.linkedInProfile &&
        fetchedAttendee.social_info.twitterName === socialInfo.twitterName &&
        fetchedAttendee.social_info.wechatUser === socialInfo.wechatUser;
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
      fetchedAttendee.public_profile_show_full_name !== showFullName ||
      fetchedAttendee.public_profile_allow_chat_with_me !== allowChatWithMe ||
      fetchedAttendee.public_profile_show_photo !== showProfilePic ||
      fetchedAttendee.public_profile_show_social_media_info !==
        showSocialInfo ||
      fetchedAttendee.public_profile_show_bio != showBio
    );
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
    showFullName,
    allowChatWithMe,
    showProfilePic,
    showSocialInfo,
    showBio
  ) {
    const { data, error } = await this._client
      .from("attendees_news")
      .upsert([
        {
          attendee_id: id,
          summit_id: this._summitId,
          full_name:
            showFullName && fullName && fullName !== "null"
              ? fullName
              : ANONYMOUS_USER_NAME,
          email: showEmail ? email : ANONYMOUS_USER_EMAIL,
          company: showBio ? company : "",
          title: showBio ? title : "",
          pic_url: showProfilePic ? picUrl : "",
          idp_user_id: idpUserId,
          is_online: isOnline,
          social_info: showSocialInfo ? socialInfo : {},
          badges_info: badgeFeatures,
          bio: showBio ? bio : "",
          public_profile_show_email: showEmail,
          public_profile_show_full_name: showFullName,
          public_profile_allow_chat_with_me: allowChatWithMe,
          public_profile_show_photo: showProfilePic,
          public_profile_show_social_media_info: showSocialInfo,
          public_profile_show_bio: showBio,
          current_url: ""
        }
      ])
      .select();

    console.log("_addAttendee", data);

    if (error) {
      console.log("_addAttendee", error);
      throw new Error(error);
    }
  }

  async _updateAttendee(
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
    showFullName,
    allowChatWithMe,
    showProfilePic,
    showSocialInfo,
    showBio
  ) {
    const { error } = await this._client
      .from("attendees_news")
      .update([
        {
          full_name:
            showFullName && fullName && fullName !== "null"
              ? fullName
              : ANONYMOUS_USER_NAME,
          email: showEmail ? email : ANONYMOUS_USER_EMAIL,
          company: showBio ? company : "",
          title: showBio ? title : "",
          pic_url: showProfilePic ? picUrl : "",
          idp_user_id: idpUserId,
          is_online: isOnline,
          social_info: showSocialInfo ? socialInfo : {},
          badges_info: badgeFeatures,
          bio: showBio ? bio : "",
          public_profile_show_email: showEmail,
          public_profile_show_full_name: showFullName,
          public_profile_allow_chat_with_me: allowChatWithMe,
          public_profile_show_photo: showProfilePic,
          public_profile_show_social_media_info: showSocialInfo,
          public_profile_show_bio: showBio
        }
      ])
      .eq("attendee_id", id)
      .eq("summit_id", this._summitId);

    if (error) console.log("_updateAttendee error", error);
  }

  async _get(id) {
    try {
      const attFetchRes = await this._client
        .from("attendees_news")
        .select(ATTTENDEES_SELECT_PROJ)
        .eq("idp_user_id", id)
        .eq("summit_id", this._summitId);

      if (attFetchRes.error) throw new Error(attFetchRes.error);

      if (attFetchRes.data && attFetchRes.data.length > 0) {
        return attFetchRes.data[0];
      }
    } catch (error) {
      console.log("error", error);
    }
    return null;
  }

  somethigChange(localAttendee, remoteAttendee) {
    if (!localAttendee || !remoteAttendee) return false;
    const {
      id,
      bio,
      company,
      fullName,
      picUrl,
      allowChatWithMe,
      showBio,
      showEmail,
      showFullName,
      showProfilePic,
      showSocialInfo,
      socialInfo,
      title
    } = localAttendee;

    const badgeFeatures = localAttendee.getBadgeFeatures();

    return this._somethigChange(
      remoteAttendee,
      fullName,
      company,
      title,
      picUrl,
      parseInt(id),
      true, // isOnline
      socialInfo,
      badgeFeatures,
      bio,
      showEmail,
      showFullName,
      allowChatWithMe,
      showProfilePic,
      showSocialInfo,
      showBio
    );
  }

  async findAttendeeByIdpUserId(idpUserId) {
    return this._get(idpUserId);
  }

  async findByNameOrCompany(
    filter,
    url,
    ageMinutesBackward = DEFAULT_MIN_BACKWARD
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString();
      const { scopeFieldName, scopeFieldVal } = url
        ? { scopeFieldName: "current_url", scopeFieldVal: url }
        : { scopeFieldName: "summit_id", scopeFieldVal: this._summitId };

      const byNameRes = await this._client
        .from("attendees_news")
        .select("*")
        .eq(scopeFieldName, scopeFieldVal)
        .eq("is_online", true)
        .gt("updated_at", ageTreshold)
        .ilike("full_name", `%${filter}%`);
      if (byNameRes.error) throw new Error(byNameRes.error);

      const byCompanyRes = await this._client
        .from("attendees_news")
        .select("*")
        .eq(scopeFieldName, scopeFieldVal)
        .eq("is_online", true)
        .gt("updated_at", ageTreshold)
        .ilike("company", `%${filter}%`);
      if (byCompanyRes.error) throw new Error(byCompanyRes.error);

      const attByName = byNameRes.data.filter((el) => el);
      const attByCompany = byCompanyRes.data.filter((el) => el);

      const seen = new Set();
      const res = [...attByName, ...attByCompany].filter((el) => {
        const duplicate = seen.has(el.id);
        seen.add(el.id);
        return !duplicate;
      });
      return res;
    } catch (error) {
      console.error("error", error);
      return [];
    }
  }

  findByNameOrCompanyLocally(list, filter, url) {
    const attByName = list.filter(
      (a) =>
        a.full_name && a.full_name.toLowerCase().includes(filter.toLowerCase())
    );
    const attByCompany = list.filter(
      (a) => a.company && a.company.toLowerCase().includes(filter.toLowerCase())
    );
    const res = [...attByName, ...attByCompany];
    return url ? res.filter((a) => a.current_url === url) : res;
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
        .toString();

      const lowerIx = pageIx * pageSize;
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize);
      const { data, error } = await this._client
        .from("attendees_news")
        .select("*")
        .eq("current_url", url)
        .eq("is_online", true)
        .neq("full_name", null)
        .gt("updated_at", ageTreshold)
        // .order('updated_at', { ascending: false })
        .order("full_name")
        .range(lowerIx, upperIx);

      if (error) throw new Error(error);
      return data;
    } catch (error) {
      console.error("error", error);
      return null;
    }
  }

  async fetchCurrentShowAttendees(
    pageIx = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    ageMinutesBackward = DEFAULT_MIN_BACKWARD
  ) {
    try {
      const ageTreshold = DateTime.utc()
        .minus({ minutes: ageMinutesBackward })
        .toString();
      const lowerIx = pageIx * pageSize;
      const upperIx = lowerIx + (pageSize > 0 ? pageSize - 1 : pageSize);
      const { data, error } = await this._client
        .from("attendees_news")
        .select("*")
        .eq("summit_id", this._summitId)
        .eq("is_online", true)
        .neq("full_name", null)
        .gt("updated_at", ageTreshold)
        // .order('updated_at', { ascending: false })
        .order("full_name")
        .range(lowerIx, upperIx);

      if (error) throw new Error(error);
      return data;
    } catch (error) {
      console.error("error", error);
      return null;
    }
  }

  async getRole(idpUserId) {
    try {
      const { data, error } = await this._client
        .from("summit_attendee_roles")
        .select("summit_id, summit_event_id")
        .eq("summit_id", this._summitId)
        .eq("idp_user_id", idpUserId);
      if (error) throw new Error(error);
      if (data.length === 0) return roles.USER;
      const roleItem = data[0];
      if (roleItem.summit_event_id > 0) return roles.QA;
      return roles.HELP;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  signOut() {
    try {
      if (this._sbUser) {
        this._client
          .from("attendees_news")
          .update([{ is_online: false }])
          .eq("attendee_id", this._sbUser.id)
          .eq("summit_id", this._summitId)
          .then(() => {
            // console.log(data)
            this._sbUser = null;
          });
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  me() {
    return this._sbUser;
  }
}
