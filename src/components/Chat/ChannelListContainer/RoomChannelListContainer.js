import React, { useEffect, useState } from 'react'
import { Chat } from 'stream-chat-react'
import { SearchBar } from '../../SearchBar/SearchBar'
import { RoomsManager } from '../RoomsManager/RoomsManager'
import ChannelListContainer, { channelType } from './ChannelListContainer'

import style from './style.module.scss'

const RoomChannelListContainer = ({
  user,
  summitId,
  chatClient,
  accessRepo,
  onItemClick,
  height,
  openDir
}) => {
  let curMode = 0
  const [currFilters, setCurrFilters] = useState([])
  const [showRoomsManager, setShowRoomsManager] = useState(false)

  useEffect(() => {
    setUpMode(0)
  }, [])

  const setUpMode = (mode) => {
    switch (mode) {
      case 1:
        setCurrFilters([
          {
            type: 'activity_room',
            members: { $in: [user.id] },
            id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
          }
        ])
        break
      case 2:
        setCurrFilters([
          {
            type: 'custom_room',
            members: { $in: [user.id] },
            id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
          }
        ])
        break
      default:
        //All Chat Rooms
        setCurrFilters([
          {
            type: 'help_room'
            //members: { $in: [user.id] }
          },
          {
            type: 'qa_room'
            //members: { $in: [user.id] }
          },
          {
            type: 'activity_room',
            members: { $in: [user.id] },
            id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
          },
          {
            type: 'custom_room',
            members: { $in: [user.id] },
            id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
          }
        ])
        break
    }
  }

  const handleSearch = async (e) => {
    const { value } = e.target
  }

  const handleFilterModeChange = (mode) => {
    //TODO: Debounce search
    curMode = mode
    setUpMode(mode)
  }

  const handleRoomCreateClick = () => {
    setShowRoomsManager(true)
  }

  const handleBackClick = () => {
    console.log('handleBackClick')
    setShowRoomsManager(false)
  }

  return (
    <div style={{ height: height }}>
      {!showRoomsManager && (
        <div>
          <SearchBar
            onSearch={handleSearch}
            onFilterModeChange={handleFilterModeChange}
            filterMenuOptions={[
              'All Chat Rooms',
              'Activity Rooms',
              'Custom Rooms'
            ]}
          />
          <div className={style.channelsListWrapper}>
            <Chat client={chatClient}>
              {currFilters.map((filtersItem, ix) => (
                <ChannelListContainer
                  key={ix}
                  selectedChannelType={channelType.ROOM}
                  filters={filtersItem}
                  user={user}
                  summitId={summitId}
                  chatClient={chatClient}
                  onItemClick={onItemClick}
                />
              ))}
            </Chat>
          </div>
          <div className='has-text-centered mt-2'>
            <button className='button is-large' onClick={handleRoomCreateClick}>
              <span className='icon'>
                <i className='fa fa-plus'></i>
              </span>
              <span>New Custom Room</span>
            </button>
          </div>
        </div>
      )}
      {showRoomsManager && (
        <RoomsManager openDir={openDir} onBack={handleBackClick} accessRepo={accessRepo} />
      )}
    </div>
  )
}

export default RoomChannelListContainer
