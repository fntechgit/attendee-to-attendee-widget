import React, { useEffect, useState } from 'react'
import { Chat } from 'stream-chat-react'
import debounce from 'lodash.debounce'
import { SearchBar } from '../../SearchBar/SearchBar'
import RoomsManager from '../RoomsManager/RoomsManager'
import ChannelListContainer from './ChannelListContainer'
import StreamChatService from '../../../lib/services/StreamChatService'
import { channelTypes } from '../../../models/channel_types'

import style from './style.module.scss'

let handleSearchDebounce = null

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
  const defaultFilters = {
    type: {
      $in: [
        channelTypes.ACTIVITY_ROOM,
        channelTypes.HELP_ROOM,
        channelTypes.QA_ROOM,
        channelTypes.CUSTOM_ROOM
      ]
    }
  }
  const [currFilters, setCurrFilters] = useState(defaultFilters)
  const [showRoomsManager, setShowRoomsManager] = useState(false)

  useEffect(() => {
    setUpMode(0)
  }, [])

  const setUpMode = (mode) => {
    switch (mode) {
      case 1:
        setCurrFilters({
          type: {
            $in: [channelTypes.ACTIVITY_ROOM]
          }
        })
        break
      case 2:
        setCurrFilters({
          type: {
            $in: [channelTypes.CUSTOM_ROOM]
          }
        })
        break
      default:
        //All Chat Rooms
        setCurrFilters(defaultFilters)
        break
    }
  }

  const handleSearch = async (e) => {
    const { value } = e.target

    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      setCurrFilters({
        type: {
          $in: [channelTypes.CUSTOM_ROOM]
        }
        //name: { $in: [value] }
      })
    }, 300)

    if (value && value.length > 2) {
      handleSearchDebounce()
    }
  }

  const handleSearchClear = async () => {
    setCurrFilters(defaultFilters)
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
            onClear={handleSearchClear}
            onFilterModeChange={handleFilterModeChange}
            filterMenuOptions={[
              'All Chat Rooms',
              'Activity Rooms',
              'Custom Rooms'
            ]}
          />
          <div className={style.channelsListWrapper}>
            <Chat client={chatClient}>
              <ChannelListContainer
                selectedChannelType={channelTypes.CUSTOM_ROOM}
                filters={currFilters}
                user={user}
                summitId={summitId}
                chatClient={chatClient}
                onItemClick={onItemClick}
              />
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
