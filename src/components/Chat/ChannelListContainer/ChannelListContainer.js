import React from 'react'
import {
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator
} from 'stream-chat-react'
import DirectMessageChannelPreview from '../ChannelPreview/DirectMessageChannelPreview'
import RoomChannelPreview from '../ChannelPreview/RoomChannelPreview'
import { channelTypes } from '../../../models/channelTypes'

import style from './style.module.scss'

const CustomEmptyStateIndicator = (isRoomChatChannel) => {
  if (isRoomChatChannel) {
    return <div />
  }
  return <div className={style.noChannels}>No active conversations</div>
}

const CustomLoadingIndicator = () => {
  return <div />
}

const ChannelListContainer = ({
  user,
  chatClient,
  onItemClick,
  onDelete,
  isRoomChatChannel,
  filters,
  sort,
  options
}) => {
  if (!chatClient) {
    return <LoadingIndicator />
  }

  return (
    <div className={style.channelsListWrapper}>
      <ChannelList
        key={`channel-list-users`}
        filters={filters}
        options={options}
        sort={sort}
        List={ChannelListMessenger}
        Preview={(previewProps) => {
          const { type } = previewProps.channel
          return type === channelTypes.MESSAGING ||
            type === channelTypes.HELP_ROOM ||
            type === channelTypes.QA_ROOM ? (
            <DirectMessageChannelPreview
              {...previewProps}
              onItemClick={onItemClick}
            />
          ) : (
            <RoomChannelPreview
              user={user}
              {...previewProps}
              onItemClick={onItemClick}
              onDelete={onDelete}
            />
          )
        }}
        EmptyStateIndicator={() => (
          <CustomEmptyStateIndicator isRoomChatChannel={isRoomChatChannel} />
        )}
        //LoadingIndicator={CustomLoadingIndicator}
        setActiveChannelOnMount={false}
        me={user}
      />
    </div>
  )
}

export default ChannelListContainer
