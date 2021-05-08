import React from 'react'
import {
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator
} from 'stream-chat-react'
import DirectMessageChannelPreview from '../ChannelPreview/DirectMessageChannelPreview'
import RoomChannelPreview from '../ChannelPreview/RoomChannelPreview'

import style from './style.module.scss'

export const channelType = {
  DIRECT_MESSAGE: 'direct_message',
  ROOM: 'room'
}

const CustomEmptyStateIndicator = () => {
  return <div className={styles.noChannels}>No active conversations</div>
}

const CustomLoadingIndicator = () => {
  return <div />
}

const ChannelListContainer = ({
  user,
  chatClient,
  onItemClick,
  selectedChannelType,
  filters
}) => {
  const sort = {
    //last_message_at: -1
    has_unread: -1
  }
  const options = {
    watch: true,
    limit: 20
  }

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
        Preview={(previewProps) =>
          selectedChannelType === channelType.DIRECT_MESSAGE ? (
            <DirectMessageChannelPreview
              {...previewProps}
              onItemClick={onItemClick}
            />
          ) : (
            <RoomChannelPreview {...previewProps} onItemClick={onItemClick} />
          )
        }
        EmptyStateIndicator={CustomEmptyStateIndicator}
        LoadingIndicator={CustomLoadingIndicator}
        setActiveChannelOnMount={false}
        me={user}
      />
    </div>
  )
}

export default ChannelListContainer
