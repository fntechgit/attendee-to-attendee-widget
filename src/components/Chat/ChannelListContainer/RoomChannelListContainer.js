import React, { useState } from 'react'
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
  const defaultScope = [
    channelTypes.ACTIVITY_ROOM,
    channelTypes.HELP_ROOM,
    channelTypes.QA_ROOM,
    channelTypes.CUSTOM_ROOM
  ]

  let currentScope = defaultScope

  const defaultFilters = {
    type: {
      $in: defaultScope
    }
  }
  const [currFilters, setCurrFilters] = useState(defaultFilters)
  const [showRoomsManager, setShowRoomsManager] = useState(false)

  const getScope = (mode) => {
    if (mode === 1) return [channelTypes.ACTIVITY_ROOM]
    if (mode === 2) return [channelTypes.CUSTOM_ROOM]
    return defaultScope
  }

  const buildFilter = (scope, name) => {
    return name
      ? {
          type: {
            $in: scope
          },
          id: { $in: [name] }
        }
      : {
          type: {
            $in: scope
          }
        }
  }

  const handleSearch = async (e) => {
    const { value } = e.target
    if (!value) return
    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      setCurrFilters(buildFilter(currentScope, value))
    }, 300)

    handleSearchDebounce()
  }

  const handleSearchClear = async () => {
    setCurrFilters(defaultFilters)
  }

  const handleFilterModeChange = (mode) => {
    currentScope = getScope(mode)
    setCurrFilters(buildFilter(currentScope, null))
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
            placeholder='Search by room name'
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
