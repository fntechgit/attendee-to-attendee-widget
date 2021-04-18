import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faQuestionCircle,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import { AttendeeInfo } from '../AttendeeInfo/AttendeeInfo'
import style from './style.module.scss'

export const MainBar = ({ user }) => {
  const [showAttCard, setShowAttCard] = useState(false)
  return (
    <div>
      {showAttCard && <AttendeeInfo user={user} />}
      <div className={style.mainBarContent}>
        <div
          className={style.picWrapper}
          //onClick={() => setShowAttCard(true)}
          onMouseEnter={() => setShowAttCard(true)}
          onMouseLeave={() => setShowAttCard(false)}
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
          <FontAwesomeIcon icon={faQuestionCircle} className={style.menuItem} />
          <FontAwesomeIcon icon={faChevronDown} className={style.menuItem} />
        </div>
      </div>
    </div>
  )
}
