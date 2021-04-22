import React from 'react'

import style from './style.module.scss'

export const AttendeeInfo = ({ user, fullMode }) => {
  const {
    fullName,
    title,
    company,
    picUrl,
    github_user,
    linked_in_profile,
    twitter_name,
    wechat_user,
    badge_features,
    bio
  } = user
  return (
    <div className={style.attendeeInfoContainer}>
      <div className='box'>
        <article className='media'>
          <div className='media-left'>
            <figure className='image is-128x128'>
              <img className='is-rounded' alt={fullName} src={picUrl} />
            </figure>
          </div>
          <div className='media-content'>
            <div className='content'>
              <p>
                <strong>{fullName}</strong>
                <br />
                <small>{title}</small>
                <br />
                <small>{company}</small>
              </p>
            </div>
            <nav className='level is-mobile'>
              <div className='level-left'>
                {github_user && (
                  <a
                    href={`https://github.com/${github_user}/`}
                    target='_blank'
                    className='level-item'
                  >
                    <span className='icon is-small'>
                      <i className='fa fa-github' aria-hidden='true'></i>
                    </span>
                  </a>
                )}
                {linked_in_profile && (
                  <a
                    href={linked_in_profile}
                    target='_blank'
                    className='level-item'
                  >
                    <span className='icon is-small'>
                      <i className='fa fa-linkedin' aria-hidden='true'></i>
                    </span>
                  </a>
                )}
                {twitter_name && (
                  <a
                    href={`https://twitter.com/${twitter_name}/`}
                    target='_blank'
                    className='level-item'
                  >
                    <span className='icon is-small'>
                      <i className='fa fa-twitter' aria-hidden='true'></i>
                    </span>
                  </a>
                )}
              </div>
            </nav>
            <nav className='level is-mobile'>
              <div className='level-left'>{badge_features && badge_features.map((bf) => bf)}</div>
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
