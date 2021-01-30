import React from 'react'
import PropTypes from 'prop-types'
import style from './style.module.scss'

const AttendeeDetail = ({ accessInfo, onCTA }) => {
  const attendee = accessInfo.attendees

  return (
    <div className={style.attendeeDetail}>
        <div className={style.row}>
          <div className={style.lcol}>
            Name
          </div>
          <div className={style.rcol}>
            {attendee.full_name}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.lcol}>
            Email
          </div>
          <div className={style.rcol}>
            <div>{attendee.email}</div>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.lcol}>
            IP
          </div>
          <div className={style.rcol}>
            <div>{accessInfo.attendee_ip}</div>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.lcol}>
            Last access
          </div>
          <div className={style.rcol}>
            <div>{accessInfo.updated_at}</div>
          </div>
        </div>
        <button className={style.ctaButton} onClick={() => onCTA(attendee)}>CTA</button>
    </div>
  )
}

AttendeeDetail.propTypes = {
  accessInfo: PropTypes.any.isRequired
}

export default AttendeeDetail
