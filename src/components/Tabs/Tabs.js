/**
 * Copyright 2021 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import style from './style.module.scss'

const Tab = ({ activeTab, changeActiveTab, tab: { name, showNewsBadge } }) => {
  return (
    <li
      className={name === activeTab ? 'is-active' : ''}
      onClick={() => changeActiveTab(name)}
    >
      <a style={{ textDecoration: 'none' }}>
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
