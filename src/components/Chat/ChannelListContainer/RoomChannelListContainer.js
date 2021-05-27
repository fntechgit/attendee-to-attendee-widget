import React, { useState } from 'react'
import { Chat } from 'stream-chat-react'
import debounce from 'lodash.debounce'
import { SearchBar } from '../../SearchBar/SearchBar'
import RoomsManager from '../RoomsManager/RoomsManager'
import ChannelListContainer from './ChannelListContainer'
import { nameToId } from '../../../utils/stringHelper'
import { channelTypes } from '../../../models/channel_types'
import { adminRoles } from '../../../models/local_roles'

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
  const defaultScope = [channelTypes.ACTIVITY_ROOM, channelTypes.CUSTOM_ROOM]

  let currentScope = defaultScope

  const allowRoomsManagement = adminRoles.includes(chatClient.user.local_role)

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

  const buildFilter = (scope, id) => {
    return id
      ? {
          type: {
            $in: scope
          },
          id: { $in: [id] }
        }
      : {
          type: {
            $in: scope
          }
        }
  }

  const handleSearch = async (e) => {
    const { value } = e.target
    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      setCurrFilters(
        value ? buildFilter(currentScope, nameToId(value)) : defaultFilters
      )
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
    setShowRoomsManager(false)
  }

  const handleRoomDelete = async (channel) => {
    await chatRepo.deleteChannel(channel.id)
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
                filters={currFilters}
                sort={{ type: -1 }}
                user={user}
                options={{ watch: true, limit: 20 }}
                summitId={summitId}
                chatClient={chatClient}
                onItemClick={onItemClick}
                onDelete={handleRoomDelete}
              />
            </Chat>
          </div>
          {allowRoomsManagement && (
            <div className='has-text-centered mt-2'>
              <button
                className='button is-large'
                onClick={handleRoomCreateClick}
              >
                <span className='icon'>
                  <i className='fa fa-plus'></i>
                </span>
                <span>New Custom Room</span>
              </button>
            </div>
          )}
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
