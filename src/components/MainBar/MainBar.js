import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faQuestionCircle,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import { AttendeeInfo } from '../AttendeeInfo/AttendeeInfo'
import style from './style.module.scss'

export const MainBar = ({ user, onMinimizeButtonClick }) => {
  const [showAttCard, setShowAttCard] = useState(false)
  let isCardHovered = false

  const handleClick = () => {
    if (!showAttCard) setShowAttCard(true)
  }

  const handleMouseEnter = () => {
    setShowAttCard(true)
  }

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!isCardHovered) setShowAttCard(false)
    }, 100)
  }

  const handleCardMouseEnter = () => {
    isCardHovered = true
  }

  const handleCardMouseLeave = () => {
    isCardHovered = false
    setShowAttCard(false)
  }

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
          <FontAwesomeIcon icon={faQuestionCircle} className={style.menuItem} />
          <FontAwesomeIcon icon={faChevronDown} className={style.menuItem} onClick={onMinimizeButtonClick} />
        </div>
      </div>
    </div>
  )
}
