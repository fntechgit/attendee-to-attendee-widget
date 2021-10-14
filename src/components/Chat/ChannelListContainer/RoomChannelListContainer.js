import React, { useState } from 'react'
import { Chat } from 'stream-chat-react'
import debounce from 'lodash.debounce'
import { SearchBar } from '../../SearchBar/SearchBar'
import RoomsManager from '../RoomsManager/RoomsManager'
import ChannelListContainer from './ChannelListContainer'
import { nameToId } from '../../../utils/stringHelper'
import { channelTypes } from '../../../models/channelTypes'
import { permissions } from '../../../models/permissions'

import style from './style.module.scss'

let handleSearchDebounce = null

const RoomChannelListContainer = ({
  user,
  summitId,
  chatClient,
  accessRepo,
  chatRepo,
  onHelpClick,
  onQAClick,
  onItemClick,
  height,
  openDir,
  showHelpButton,
  showQAButton
}) => {
  const defaultScope = [channelTypes.ACTIVITY_ROOM, channelTypes.CUSTOM_ROOM]

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
          name: { $eq: name }
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
      setCurrFilters(value ? buildFilter(currentScope, value) : defaultFilters)
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
    <div>
      {!showRoomsManager && (
        <div>
          <SearchBar
            onSearch={handleSearch}
            onClear={handleSearchClear}
            onFilterModeChange={handleFilterModeChange}
            // filterMenuOptions={[
            //   'All Chat Rooms',
            //   'Activity Rooms',
            //   'Custom Rooms'
            // ]}
            placeholder='Search by room name'
          />
          <div className={style.channelsListWrapper} style={{ height: height }}>
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
          <div className='has-text-centered mt-2'>
            {showHelpButton && (
              <button
                className='button is-light is-large'
                onClick={onHelpClick}
              >
                <span className='icon'>
                  <i className='fa fa-question-circle'></i>
                </span>
                <span>Help Desk</span>
              </button>
            )}
            {showQAButton && (
              <button
                className='button is-light is-large ml-3'
                onClick={onQAClick}
              >
                <span className='icon'>
                  <i className='fa fa-comments'></i>
                </span>
                <span>Q&A</span>
              </button>
            )}
            {user.hasPermission(permissions.MANAGE_ROOMS) && (
              <button
                className='button is-light is-large ml-3'
                onClick={handleRoomCreateClick}
              >
                <span className='icon'>
                  <i className='fa fa-plus-square'></i>
                </span>
                <span>New Room</span>
              </button>
            )}
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
