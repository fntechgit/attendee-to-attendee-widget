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
      <div className='box'>
        <article className='media'>
          <div className='media-content'>
            <div className='content'>
              <div className='is-size-4'>{message}</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default Alert