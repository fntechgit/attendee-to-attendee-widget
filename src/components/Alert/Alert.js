import React from 'react'

import style from './style.module.scss'

const Alert = ({
  message,
  onClick
}) => {
 
  return (
    <div
      className={style.alertContainer}
      onClick={onClick}
    >
      <div className='is-size-4'>{message}</div>
    </div>
  )
}

export default Alert