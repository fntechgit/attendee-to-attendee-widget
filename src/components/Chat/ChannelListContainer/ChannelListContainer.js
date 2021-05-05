import React from 'react'
import {
  Chat,
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator,
  withChatContext
} from 'stream-chat-react'
import CustomChannelPreview from '../ChannelList/CustomChannelPreview'

import style from './style.module.scss'

const CustomEmptyStateIndicator = () => {
  return <div className={styles.noChannels}>No active conversations</div>
}

const CustomLoadingIndicator = () => {
  return <div />
}

const MessagesList = (props) => {
  const { user, chatClient, onItemClick } = props
  const filters = {
    type: 'messaging',
    members: { $in: [user.id] },
    id: { $nin: [`${user.id}-help`, `${user.id}-qa`] }
  }
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
    <div className={style.channelsListWrapper} style={{ height: props.height }}>
      <Chat client={chatClient}>
        <ChannelList
          key={`channel-list-users`}
          filters={filters}
          options={options}
          sort={sort}
          List={ChannelListMessenger}
          Preview={(previewProps) => (
            <CustomChannelPreview {...previewProps} onItemClick={onItemClick} />
          )}
          EmptyStateIndicator={CustomEmptyStateIndicator}
          LoadingIndicator={CustomLoadingIndicator}
          setActiveChannelOnMount={false}
          me={user}
        />
      </Chat>
    </div>
  )
}

export default MessagesList
