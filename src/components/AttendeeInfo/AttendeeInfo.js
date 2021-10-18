import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import ReactTooltip from 'react-tooltip'

import style from './style.module.scss'

export const AttendeeInfo = ({
  user,
  fullMode,
  onMouseEnter,
  onMouseLeave,
  onChatClick,
  onTap
}) => {
  const {
    fullName,
    title,
    email,
    company,
    picUrl,
    socialInfo,
    badgeFeatures,
    getBadgeFeatures,
    bio,
    public_profile_show_email,
    public_profile_allow_chat_with_me
  } = user

  const buildSocialSection = (socialInfo) => {
    const { githubUser, linkedInProfile, twitterName, wechatUser } = socialInfo
    return (
      <nav className='level is-mobile'>
        <div className='level-left'>
          {githubUser && (
            <a
              href={`https://github.com/${githubUser}/`}
              target='_blank'
              className={`${style.levelItem} level-item`}
            >
              <span className='icon is-medium'>
                <i
                  className='fa fa-lg fa-github has-text-grey'
                  aria-hidden='true'
                ></i>
              </span>
            </a>
          )}
          {linkedInProfile && (
            <a
              href={linkedInProfile}
              target='_blank'
              className={`${style.levelItem} level-item`}
            >
              <span className='icon is-medium'>
                <i
                  className='fa fa-lg fa-linkedin has-text-grey'
                  aria-hidden='true'
                ></i>
              </span>
            </a>
          )}
          {twitterName && (
            <a
              href={`https://twitter.com/${twitterName}/`}
              target='_blank'
              className={`${style.levelItem} level-item`}
            >
              <span className='icon is-medium'>
                <i
                  className='fa fa-lg fa-twitter has-text-grey'
                  aria-hidden='true'
                ></i>
              </span>
            </a>
          )}
        </div>
      </nav>
    )
  }

  const buildChatButton = (allowChatWithMe) => {
    if (allowChatWithMe) {
      return (
        <a className='level-item' onClick={() => onChatClick(user)}>
          <span className='icon-text has-text-info'>
            <span className='icon'>
              <i className='fa fa-comment' aria-hidden='true'></i>
            </span>
            <span>Chat</span>
          </span>
        </a>
      )
    }
    return (
      <a className='level-item' data-tip='Chat disabled'>
        <span className='icon-text has-text-info has-text-grey'>
          <span className='icon'>
            <i className='fa fa-comment' aria-hidden='true'></i>
          </span>
          <span>Chat</span>
        </span>
      </a>
    )
  }

  const buildEmailButton = (allowEmailMe) => {
    if (allowEmailMe) {
      return (
        <a className='level-item' href={`mailto:${email}`} target='_blank'>
          <span className='icon-text has-text-info'>
            <span className='icon'>
              <i className='fa fa-envelope' aria-hidden='true'></i>
            </span>
            <span>Email</span>
          </span>
        </a>
      )
    }
    return (
      <a className='level-item' data-tip='Email disabled'>
        <span className='icon-text has-text-info has-text-grey'>
          <span className='icon'>
            <i className='fa fa-envelope' aria-hidden='true'></i>
          </span>
          <span>Email</span>
        </span>
      </a>
    )
  }

  const buildBadgesSection = (badgeFeatures, getBadgeFeatures) => {
    let bfs = badgeFeatures
    if (getBadgeFeatures) bfs = getBadgeFeatures()
    if (!bfs) return null
    return (
      <div className={style.badgesContainer}>
        {badgeFeatures.map((bf) => (
          <div className='media-left' key={bf.name}>
            <figure className='image is-48x48'>
              <img
                className='is-rounded'
                alt=''
                src={bf.image}
                title={bf.name}
              />
            </figure>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={style.attendeeInfoContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTap}
    >
      <div className='box'>
        <article className='media'>
          <div className='media-left'>
            <figure className='image is-128x128'>
              <img className='is-rounded' alt={fullName} src={picUrl} />
            </figure>
          </div>
          <div className='media-content'>
            <div className='content'>
              <div className='is-size-3 has-text-weight-semibold'>
                {fullName}
              </div>
              <div className='is-size-4 has-text-grey'>{title}</div>
              <div className='is-size-4 has-text-grey'>{company}</div>
            </div>
            {socialInfo && buildSocialSection(socialInfo)}
            {badgeFeatures && buildBadgesSection(badgeFeatures)}
          </div>
        </article>
        <article className='mt-2'>
          <div>
            {bio && (
              <div className='content'>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{bio}</ReactMarkdown>
              </div>
            )}
            <ReactTooltip place='top' effect='solid' />
            {fullMode && (
              <nav className='level'>
                <div className='level-left'>
                  {buildChatButton(public_profile_allow_chat_with_me)}
                  {buildEmailButton(public_profile_show_email)}
                </div>
              </nav>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
