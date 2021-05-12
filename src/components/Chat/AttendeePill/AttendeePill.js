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
