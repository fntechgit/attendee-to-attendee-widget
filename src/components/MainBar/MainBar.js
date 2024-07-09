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

import React, { useState } from "react";
import { AttendeeInfo } from "../AttendeeInfo/AttendeeInfo";
import style from "./style.module.scss";

export function MainBar({ user, onHelpClick, onMinimizeButtonClick }) {
  const [showAttCard, setShowAttCard] = useState(false);
  let isCardHovered = false;

  const handleClick = () => {
    if (!showAttCard) setShowAttCard(true);
  };

  const handleMouseEnter = () => {
    setShowAttCard(true);
  };

  const handleMouseLeave = () => {
    const timeout = 100;
    setTimeout(() => {
      if (!isCardHovered) setShowAttCard(false);
    }, timeout);
  };

  const handleCardMouseEnter = () => {
    isCardHovered = true;
  };

  const handleCardMouseLeave = () => {
    isCardHovered = false;
    setShowAttCard(false);
  };

  return (
    <div>
      {showAttCard && (
        <AttendeeInfo
          user={user}
          fullMode={false}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        />
      )}
      <div className={style.mainBarContent}>
        <div
          className={style.picWrapper}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={style.pic}
            style={{ backgroundImage: `url(${user.picUrl})` }}
          />
        </div>
        <div className={style.textWrapper}>
          <div className={style.title}>Connect</div>
        </div>
        <div className={style.menu}>
          <button
            className={`button is-white is-large ${style.button}`}
            type="button"
            onClick={onHelpClick}
          >
            <span className="icon">
              <i className="fa fa-question-circle-o" aria-hidden="true" />
            </span>
          </button>
          <button
            className={`button is-white is-large ${style.button}`}
            type="button"
            onClick={onMinimizeButtonClick}
          >
            <span className="icon">
              <i className="fa fa-chevron-down" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
