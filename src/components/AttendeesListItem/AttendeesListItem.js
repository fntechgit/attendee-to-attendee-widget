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

import React from "react";
import PropTypes from "prop-types";
import { isMobile } from "react-device-detect";
import style from "./style.module.scss";

function AttendeesListItem({
  item,
  onItemClick,
  onItemPicMouseEnter,
  onItemPicMouseLeave,
  onItemPicTouch
}) {
  if (!item) return null;

  const attendee = {
    ...item,
    fullName:
      item.full_name && item.full_name != "null" ? item.full_name : "Anonymous",
    socialInfo: item.social_info,
    badgeFeatures: item.badges_info,
    bio: item.bio,
    picUrl: item.pic_url
  };

  const buildUserIcon = (attendee) => attendee.public_profile_show_photo ? (
      <div
        className={style.pic}
        style={{ backgroundImage: `url(${attendee.picUrl})` }}
      />
    ) : (
      <div>
        <i className="fa fa-user fa-3x" aria-hidden="true" />
      </div>
    );

  return (
    attendee && (
      <li className={style.attendeesListItem}>
        <div
          className={style.attendeesListItemContent}
          key={`attendee-${item.id}`}
          onMouseEnter={isMobile ? null : () => onItemPicMouseEnter(attendee)}
          onMouseLeave={isMobile ? null : onItemPicMouseLeave}
        >
          <div
            className={style.picWrapper}
            onClick={
              isMobile
                ? () => onItemPicTouch(attendee)
                : () => onItemClick(attendee)
            }
          >
            {buildUserIcon(attendee)}
          </div>
          <div
            className={style.textWrapper}
            onClick={() => onItemClick(attendee)}
          >
            <div className={style.title}>{attendee.fullName}</div>
            {attendee.company && (
              <div className={style.subtitle}>
                {attendee.title ? `${attendee.title} at ` : ""}
                {attendee.company}
              </div>
            )}
          </div>
        </div>
      </li>
    )
  );
}

AttendeesListItem.propTypes = {
  item: PropTypes.any.isRequired
};

export default AttendeesListItem;
