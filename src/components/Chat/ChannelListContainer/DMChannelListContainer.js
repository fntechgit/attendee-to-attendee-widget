import React, { useState } from 'react'
import { Chat } from 'stream-chat-react'
import debounce from 'lodash.debounce'
import { SearchBar } from '../../SearchBar/SearchBar'
import ChannelListContainer from './ChannelListContainer'
import { channelTypes } from '../../../models/channelTypes'

import style from './style.module.scss'

let handleSearchDebounce = null

const DMChannelListContainer = ({
  user,
  summitId,
  chatClient,
  accessRepo,
  onItemClick,
  height,
  activity,
  onQAClick
}) => {
  const defaultScope = [
    channelTypes.HELP_ROOM,
    channelTypes.QA_ROOM,
    channelTypes.MESSAGING
  ]

  const defaultFilters = {
    type: { $in: defaultScope },
    members: { $in: [user.id] }
  }

  const [currFilters, setCurrFilters] = useState(defaultFilters)

  const handleSearch = async (e) => {
    const { value } = e.target
    if (!value) {
      setCurrFilters(defaultFilters)
      return
    }
    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      //Fetch attendee info for matched user names
      const res = await accessRepo.findByFullName(value)

      if (res && res.length > 0) {
        let channelIds = res.map((att) => `${user.id}-${att.idp_user_id}`)
        channelIds = [
          ...res.map((att) => `${att.idp_user_id}-${user.id}`),
          ...channelIds
        ]
        setCurrFilters({
          $or: [
            {
              type: { $in: [channelTypes.HELP_ROOM, channelTypes.QA_ROOM] },
              members: { $in: [user.id] }
            },
            {
              type: { $in: defaultScope },
              id: { $in: channelIds },
              members: { $in: [user.id] }
            }
          ]
        })
      }
    }, 300)

    handleSearchDebounce()
  }

  const handleSearchClear = () => {
    setCurrFilters(defaultFilters)
  }

  return (
    <div style={{ height: height }}>
      <SearchBar onSearch={handleSearch} onClear={handleSearchClear} />
      <div className={style.channelsListWrapper}>
        <Chat client={chatClient}>
          <ChannelListContainer
            filters={currFilters}
            sort={{ supporttype: 1 }}
            options={{ watch: true, limit: 20 }}
            user={user}
            summitId={summitId}
            chatClient={chatClient}
            accessRepo={accessRepo}
            onItemClick={onItemClick}
          />
        </Chat>
      </div>
      {activity && (
        <div className='has-text-centered mt-2'>
          <button
            className='button is-large'
            onClick={() => onQAClick(activity)}
          >
            <span className='icon'>
              <i className='fa fa-comments'></i>
            </span>
            <span>Q&A</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default DMChannelListContainer