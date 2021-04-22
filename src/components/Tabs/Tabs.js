import React, { useState } from 'react'

const Tab = (props) => {
  const { name } = props.tab
  const { activeTab, changeActiveTab } = props

  return (
    <li
      className={name === activeTab ? 'is-active' : ''}
      onClick={() => changeActiveTab(name)}
    >
      <a>
        <span>{name}</span>
      </a>
    </li>
  )
}

const Tabs = ({tabList, activeTab, changeActiveTab}) => {
  return (
    <div className='tabs is-fullwidth'>
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

export {Tabs, ActiveTabContent}