import React from 'react'

import style from './style.module.scss'

export const AttendeeInfo = ({ user, fullMode, onMouseEnter, onMouseLeave }) => {
  const {
    fullName,
    title,
    company,
    picUrl,
    socialInfo,
    badgeFeatures,
    bio
  } = user

  const {
    githubUser,
    linkedInProfile,
    twitterName,
    wechatUser
  } = socialInfo

  return (
    <div className={style.attendeeInfoContainer} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className='box'>
        <article className='media'>
          <div className='media-left'>
            <figure className='image is-128x128'>
              <img className='is-rounded' alt={fullName} src={picUrl} />
            </figure>
          </div>
          <div className='media-content'>
            <div className='content'>
              <div className="is-size-5 has-text-weight-semibold">{fullName}</div>
              <div className="is-size-6 has-text-grey">{title}</div>
              <div className="is-size-6 has-text-grey">{company}</div>
            </div>
            <nav className='level is-mobile'>
              <div className='level-left'>
                {githubUser && (
                  <a
                    href={`https://github.com/${githubUser}/`}
                    target='_blank'
                    className='level-item'
                  >
                    <span className='icon is-small'>
                      <i className='fa fa-github has-text-grey' aria-hidden='true'></i>
                    </span>
                  </a>
                )}
                {linkedInProfile && (
                  <a
                    href={linkedInProfile}
                    target='_blank'
                    className='level-item'
                  >
                    <span className='icon is-small'>
                      <i className='fa fa-linkedin has-text-grey' aria-hidden='true'></i>
                    </span>
                  </a>
                )}
                {twitterName && (
                  <a
                    href={`https://twitter.com/${twitterName}/`}
                    target='_blank'
                    className='level-item'
                  >
                    <span className='icon is-small'>
                      <i className='fa fa-twitter has-text-grey' aria-hidden='true'></i>
                    </span>
                  </a>
                )}
              </div>
            </nav>
            <nav className='level is-mobile'>
              <div className='level-left'>{badgeFeatures && badgeFeatures.map((bf) => bf)}</div>
            </nav>
          </div>
        </article>
        {fullMode && (
          <article className='mt-2'>
            <div>
              <div className='content'>
                <p>{bio}</p>
              </div>
              <nav className='level is-mobile'>
                <div className='level-left'>
                  <a className='level-item'>
                    <span className='icon-text has-text-info'>
                      <span className='icon'>
                        <i className='fa fa-comment' aria-hidden='true'></i>
                      </span>
                      <span>Chat</span>
                    </span>
                  </a>
                  <a className='level-item'>
                    <span className='icon-text has-text-info'>
                      <span className='icon'>
                        <i className='fa fa-envelope' aria-hidden='true'></i>
                      </span>
                      <span>E-mail</span>
                    </span>
                  </a>
                </div>
              </nav>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
