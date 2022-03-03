import React from 'react'
import style from './style.module.scss'

const Tab = ({ activeTab, changeActiveTab, tab: { name, showNewsBadge } }) => {
  return (
    <li
      className={name === activeTab ? 'is-active' : ''}
      onClick={() => changeActiveTab(name)}
    >
      <a style={{ textDecoration: 'none' }} href='#'>
        <span>{name}</span>
        {showNewsBadge && <span className={style.unreadMessagesBadge}></span>}
      </a>
    </li>
  )
}

const Tabs = ({ tabList, activeTab, changeActiveTab }) => {
  return (
    <div className={`${style.tabs} tabs is-boxed is-fullwidth`}>
      <ul>
        {tabList.map((tab) => (
          <Tab
            tab={tab}
            key={tab.name}
            activeTab={activeTab}
            changeActiveTab={changeActiveTab}
          />
        ))}
      </ul>
    </div>
  )
}

const ActiveTabContent = (props) => <div>{props.content}</div>

export { Tabs, ActiveTabContent }
