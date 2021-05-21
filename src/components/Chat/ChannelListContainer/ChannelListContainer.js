import React from 'react'
import {
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator
} from 'stream-chat-react'
import DirectMessageChannelPreview from '../ChannelPreview/DirectMessageChannelPreview'
import RoomChannelPreview from '../ChannelPreview/RoomChannelPreview'
import { channelTypes } from '../../../models/channel_types'

import style from './style.module.scss'

const CustomEmptyStateIndicator = (selectedChannelType) => {
  if (selectedChannelType !== channelTypes.MESSAGING) {
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
          selectedChannelType === channelTypes.MESSAGING ? (
            <DirectMessageChannelPreview
              {...previewProps}
              onItemClick={onItemClick}
            />
          ) : (
            <RoomChannelPreview
              {...previewProps}
              onItemClick={onItemClick}
              onDelete={onDelete}
            />
          )
        }
        EmptyStateIndicator={() => (
          <CustomEmptyStateIndicator
            selectedChannelType={selectedChannelType}
          />
        )}
        LoadingIndicator={CustomLoadingIndicator}
        setActiveChannelOnMount={false}
        me={user}
      />
    </div>
  )
}

export default ChannelListContainer
