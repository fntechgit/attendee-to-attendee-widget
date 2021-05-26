import React, { useState } from 'react'
import { Chat } from 'stream-chat-react'
import debounce from 'lodash.debounce'
import { SearchBar } from '../../SearchBar/SearchBar'
import RoomsManager from '../RoomsManager/RoomsManager'
import ChannelListContainer from './ChannelListContainer'
import { nameToId } from '../../../utils/stringHelper'
import { channelTypes } from '../../../models/channel_types'
import { adminRole } from '../../../models/local_roles'

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

  let selectedFilterMode = 0

  const allowRoomsManagement = user.role === adminRole

  const defaultFilters = {
    $or: [
      {
        type: {
          $in: [channelTypes.HELP_ROOM, channelTypes.QA_ROOM]
        },
        members: { $in: [user.id] }
      },
      {
        type: {
          $in: [channelTypes.ACTIVITY_ROOM, channelTypes.CUSTOM_ROOM]
        }
      }
    ]
  }

  const [currFilters, setCurrFilters] = useState(defaultFilters)
  const [showRoomsManager, setShowRoomsManager] = useState(false)

  const buildFilter = (filterMode, id) => {
    // return id
    //   ? {
    //       type: {
    //         $in: scope
    //       },
    //       id: { $in: [id] }
    //     }
    //   : {
    //       type: {
    //         $in: scope
    //       }
    //     }

    const supportScope =
      selectedFilterMode === 0
        ? [channelTypes.HELP_ROOM, channelTypes.QA_ROOM]
        : ['']
    let roomsScope = [channelTypes.ACTIVITY_ROOM, channelTypes.CUSTOM_ROOM]

    if (selectedFilterMode === 1) roomsScope = [channelTypes.ACTIVITY_ROOM]
    if (selectedFilterMode === 2) roomsScope = [channelTypes.CUSTOM_ROOM]

    return id
      ? {
          $or: [
            {
              type: {
                $in: supportScope
              },
              members: { $in: [user.id] }
            },
            {
              type: {
                $in: roomsScope
              }
            }
          ],
          id: { $in: [id] }
        }
      : {
          $or: [
            {
              type: {
                $in: supportScope
              },
              members: { $in: [user.id] }
            },
            {
              type: {
                $in: roomsScope
              }
            }
          ]
        }
  }

  const handleSearch = async (e) => {
    const { value } = e.target
    if (handleSearchDebounce) handleSearchDebounce.cancel()
    handleSearchDebounce = debounce(async () => {
      const roomId = nameToId(value)
      setCurrFilters(
        value ? buildFilter(selectedFilterMode, roomId) : defaultFilters
      )
    }, 300)

    handleSearchDebounce()
  }

  const handleSearchClear = async () => {
    setCurrFilters(defaultFilters)
  }

  const handleFilterModeChange = (mode) => {
    selectedFilterMode = mode
    setCurrFilters(buildFilter(selectedFilterMode, null))
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
                isRoomChatChannel={true}
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
