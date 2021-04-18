import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faQuestionCircle,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import style from './style.module.scss'

export const MainBar = ({ user }) => {
  return (
    <div className={style.mainBarContent} onClick={() => {}}>
      <div className={style.picWrapper}>
        <div
          className={style.pic}
          style={{ backgroundImage: `url(${user.picUrl})` }}
        />
      </div>
      <div className={style.textWrapper}>
        <div className={style.title}>Connect</div>
      </div>
      <div className={style.menu}>
        <FontAwesomeIcon icon={faQuestionCircle} />
        <FontAwesomeIcon icon={faChevronDown} />
      </div>
    </div>
  )
}
