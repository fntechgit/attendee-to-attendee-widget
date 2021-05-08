import React, { useState } from 'react'
import { Chat } from 'stream-chat-react'
import { SearchBar } from '../../SearchBar/SearchBar'
import ChannelListContainer, { channelType } from './ChannelListContainer'

import style from './style.module.scss'

const RoomChannelListContainer = ({
  user,
  summitId,
  chatClient,
  onItemClick,
  height
}) => {
  const filters = {
    type: 'messaging',
    members: { $in: [user.id] },
    id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
  }

  const [currFilters, setCurrFilters] = useState([filters])

  const handleSearch = async (e) => {
    const { value } = e.target

    //TODO: Debounce search

    switch (expresión) {
      case 1:
        setCurrFilters([
          {
            type: 'activity_room',
            members: { $in: [user.id] }
          }
        ])
        break
      case 2:
        setCurrFilters([
          {
            type: 'custom_room',
            members: { $in: [user.id] }
          }
        ])
        break
      default:
        //All Chat Rooms
        setCurrFilters([
          {
            type: 'activity_room',
            members: { $in: [user.id] }
          },
          {
            type: 'custom_room',
            members: { $in: [user.id] }
          }
        ])
        break
    }
  }

  const handleFilterModeChange = (mode) => {
    console.log('mode', mode)
  }
  console.log('currFilters', currFilters)
  return (
    <div style={{ height: height }}>
      <SearchBar
        onSearch={handleSearch}
        onFilterModeChange={handleFilterModeChange}
        filterMenuOptions={['All Chat Rooms', 'Activity Rooms', 'Custom Rooms']}
      />
      <div className={style.channelsListWrapper}>
        <Chat client={chatClient}>
          {currFilters.forEach((filtersItem) => {
            console.log('filtersItem', filtersItem)
            return <div>{filtersItem.type}</div>
          })}
          {/* {currFilters.forEach((filtersItem) => (
            <ChannelListContainer
              selectedChannelType={channelType.ROOM}
              filters={filtersItem}
              user={user}
              summitId={summitId}
              chatClient={chatClient}
              onItemClick={onItemClick}
            />
          ))} */}
        </Chat>
      </div>
      <div className='has-text-centered mt-2'>
        <button className='button is-large'>
          <span className='icon'>
            <i className='fa fa-plus'></i>
          </span>
          <span>New Custom Room</span>
        </button>
      </div>
    </div>
  )
}

export default RoomChannelListContainer
