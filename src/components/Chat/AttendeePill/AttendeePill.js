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
 **/

import React from 'react'
import style from './style.module.scss'

const AttendeePill = ({ attendee, onClose }) => {
  return (
    attendee && (
      <div className={style.attendeesPill}>
        <div className={style.picWrapper}>
          <div
            className={style.pic}
            style={{ backgroundImage: `url(${attendee.pic_url})` }}
          />
        </div>
        <div className={style.textWrapper}>{attendee.full_name}</div>
        <a className={style.clear} onClick={() => onClose(attendee.id)}>x</a>
      </div>
    )
  )
}

export default AttendeePill
