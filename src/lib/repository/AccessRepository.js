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

import AttendeeRepository, { ATTENDEES_TABLE_NAME } from "./AttendeeRepository";
import { CHANNEL_STATES } from "../constants";

const ATTENDEES_CHANNEL_NAME = "attendees_news";
const TRACKING_TABLE_NAME = "access_tracking";
const DEFAULT_SCHEMA = "public";

export default class AccessRepository extends AttendeeRepository {
  constructor(supabaseService, subscribeToRealtime, summitId) {
    super(supabaseService, null, summitId);
    this._newsListener = null;
    if (subscribeToRealtime) this.refreshRealtimeSubscription();
  }

  async _logAccess(accessEntry) {
    // console.log('_logAccess: ', accessEntry)
    const { error } = await this._client.from(TRACKING_TABLE_NAME).insert([
      {
        atendee_news_id: accessEntry.id,
        summit_id: accessEntry.summit_id,
        url: accessEntry.current_url
      }
    ]);

    if (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  _handleRTSubscriptionNews(news) {
    if (this._newsListener) {
      this._newsListener(news);
    }
  }

  _isJoined() {
    return this._subscription?.state === CHANNEL_STATES.joined;
  }

  _isJoining() {
    return this._subscription?.state === CHANNEL_STATES.joining;
  }

  refreshRealtimeSubscription() {
    // const subscriptions = this._client.getSubscriptions()
    if (this._isJoined() || this._isJoining()) return;

    console.log(
      "A2A::AccessRepository::refreshRealtimeSubscription - re-subscribing to realtime..."
    );

    if (this._subscription) this._client.removeSubscription(this._subscription);

    this._subscription = this._client
      .channel(ATTENDEES_CHANNEL_NAME)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: DEFAULT_SCHEMA,
          table: ATTENDEES_TABLE_NAME
        },
        (payload) => {
          this._handleRTSubscriptionNews(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: DEFAULT_SCHEMA,
          table: ATTENDEES_TABLE_NAME
        },
        (payload) => {
          this._handleRTSubscriptionNews(payload.new);
        }
      )
      .subscribe();

    // console.log('subscriptions count', this._client.getSubscriptions()?.length)
    console.log(
      "A2A::AccessRepository::refreshRealtimeSubscription - re-subscribed to realtime:",
      this._subscription?.state
    );
  }

  sortByAttName(attendeesNews) {
    return attendeesNews.sort((a, b) => {
      const fa = a.full_name?.toLowerCase();
      const fb = b.full_name?.toLowerCase();
      if (fa < fb) return -1;
      if (fa > fb) return 1;
      return 0;
    });
  }

  async trackAccess(attendeeProfile, url, mustLogAccess) {
    try {
      attendeeProfile.isOnline = true;

      if (
        !this._sbUser ||
        this._sbUser.email !== attendeeProfile.email ||
        this._sbUser.is_online !== attendeeProfile.isOnline
      ) {
        this._sbUser = await this._initializeAttendeeUser(attendeeProfile);
      }

      if (!this._sbUser) {
        console.error("user not found");
        return;
      }

      const { data, error } = await this._client
        .from(ATTENDEES_TABLE_NAME)
        .update([
          {
            current_url: url
          }
        ])
        .eq("attendee_id", this._sbUser.id)
        .eq("summit_id", this._summitId)
        .select();

      if (error) {
        console.error("error updating attendees news", error);
        return;
      }
      if (mustLogAccess) {
        await this._logAccess(data[0]);
      }
    } catch (error) {
      console.error("A2A::AccessRepository::trackAccess - error", error);
    }
  }

  cleanUpAccess() {
    try {
      if (this._sbUser) {
        this.signOut();
        this._client
          .from(ATTENDEES_TABLE_NAME)
          .update([{ current_url: "" }])
          .match({ attendee_id: this._sbUser.id, summit_id: this._summitId });
      }
    } catch (error) {
      console.error("A2A::AccessRepository::cleanUpAccess - error", error);
    }
  }

  mergeChanges(attendeesListLocal, attendeesNews) {
    let res = null;

    const oldItemVerOccurrences = attendeesListLocal.filter(
      (item) => item.id === attendeesNews.id
    );
    // already exists locally
    if (oldItemVerOccurrences.length > 0) {
      // console.log('merge with an existing element')
      res = attendeesListLocal.filter((item) => item.id !== attendeesNews.id);

      if (attendeesNews.is_online) {
        res.unshift(attendeesNews);
      }
    } else {
      // console.log('merge with a new element')
      res = [...attendeesListLocal];
      res.unshift(attendeesNews);
    }

    return this.sortByAttName(
      res.filter(
        (v, i, a) => a.findIndex((t) => t.attendee_id === v.attendee_id) === i
      )
    );
  }

  filterSameURLAttendees(attendeesList, url) {
    return attendeesList.filter((a) => a.current_url === url);
  }

  subscribe(listener) {
    this._newsListener = listener;
  }
}
