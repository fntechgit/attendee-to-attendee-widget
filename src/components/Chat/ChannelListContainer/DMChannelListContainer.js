import React, { useState } from 'react'
import { Chat } from 'stream-chat-react'
import { SearchBar } from '../../SearchBar/SearchBar'
import ChannelListContainer, {
  channelType
} from './ChannelListContainer'

import style from './style.module.scss'

const DMChannelListContainer = ({
  user,
  summitId,
  chatClient,
  accessRepo,
  onItemClick,
  height
}) => {
  const filters = {
    type: 'messaging',
    members: { $in: [user.id] },
    id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
  }

  const [currFilters, setCurrFilters] = useState(filters)

  const handleSearch = async (e) => {
    const { value } = e.target

    //TODO: Debounce search

    if (value && value.length > 4) {
      //Fetch attendee info for matched user names
      const res = await accessRepo.findByFullName(value)
      if (res) {
        const filteredUserIds = res.map((att) => `${att.idp_user_id}`)
        setCurrFilters({
          type: 'messaging',
          members: { $in: [user.id, ...filteredUserIds] }
        })
      }
    }
  }

  return (
    <div style={{ height: height }}>
      <SearchBar onSearch={handleSearch} />
      <div className={style.channelsListWrapper}>
        <Chat client={chatClient}>
          <ChannelListContainer
            selectedChannelType={channelType.DIRECT_MESSAGE}
            filters={currFilters}
            user={user}
            summitId={summitId}
            chatClient={chatClient}
            accessRepo={accessRepo}
            onItemClick={onItemClick}
          />
        </Chat>
      </div>
    </div>
  )
}

export default DMChannelListContainer
