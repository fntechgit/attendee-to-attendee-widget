import React, { useState } from 'react'
import { AttendeeInfo } from '../AttendeeInfo/AttendeeInfo'
import style from './style.module.scss'

export const MainBar = ({ user, onHelpClick, onMinimizeButtonClick }) => {
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
          <button className='button is-white is-large' onClick={onHelpClick}>
            <span className='icon'>
              <i className='fa fa-question-circle-o' aria-hidden='true'></i>
            </span>
          </button>
          <button className='button is-white is-large' onClick={onMinimizeButtonClick}>
            <span className='icon'>
              <i className='fa fa-chevron-down' aria-hidden='true'></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
