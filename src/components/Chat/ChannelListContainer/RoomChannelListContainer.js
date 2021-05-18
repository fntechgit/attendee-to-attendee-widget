import React, { useEffect, useState } from 'react'
import { Chat } from 'stream-chat-react'
import { SearchBar } from '../../SearchBar/SearchBar'
import RoomsManager from '../RoomsManager/RoomsManager'
import ChannelListContainer from './ChannelListContainer'
import StreamChatService from '../../../lib/services/StreamChatService'
import { channelTypes } from '../../../models/channel_types'

import style from './style.module.scss'

const RoomChannelListContainer = ({
  user,
  summitId,
  chatClient,
  accessRepo,
  chatRepo,
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
            type: channelTypes.ACTIVITY_ROOM,
            members: { $in: [user.id] }
          }
        ])
        break
      case 2:
        setCurrFilters([
          {
            type: channelTypes.CUSTOM_ROOM,
            members: { $in: [user.id] }
          }
        ])
        break
      default:
        //All Chat Rooms
        setCurrFilters([
          {
            type: channelTypes.HELP_ROOM,
            members: { $in: [user.id] }
          },
          {
            type: channelTypes.QA_ROOM,
            members: { $in: [user.id] }
          },
          {
            type: channelTypes.ACTIVITY_ROOM,
            members: { $in: [user.id] }
          },
          {
            type: channelTypes.CUSTOM_ROOM
            //members: { $in: [user.id] }
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
                  selectedChannelType={channelTypes.CUSTOM_ROOM}
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
          <div className='has-text-centered mt-2'>
            <button
              className='button is-primary is-large is-fullwidth'
              onClick={async () => {
                await StreamChatService.deleteChannel(chatClient, 'test')
                await StreamChatService.deleteChannel(chatClient, 'test2')
                await StreamChatService.deleteChannel(chatClient, '13-qa')
                await StreamChatService.deleteChannel(chatClient, '13-help')
              }}
            >
              Remove all rooms
            </button>
          </div>
        </div>
      )}
      {showRoomsManager && (
        <RoomsManager
          openDir={openDir}
          onBack={handleBackClick}
          accessRepo={accessRepo}
          chatRepo={chatRepo}
          chatClient={chatClient}
        />
      )}
    </div>
  )
}

export default RoomChannelListContainer
