import React, { useState } from 'react'
import { IconButton } from '@material-ui/core'
import { HelpOutlined, KeyboardArrowDown } from '@material-ui/icons'
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
          onClick={() => setShowAttCard(!showAttCard)}
          // onMouseEnter={() => setShowAttCard(true)}
          // onMouseLeave={() => setShowAttCard(false)}
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
           <IconButton>
            <HelpOutlined fontSize="small"/>
          </IconButton>
          <IconButton>
            <KeyboardArrowDown fontSize="small"/>
          </IconButton>
        </div>
      </div>
    </div>
  )
}
