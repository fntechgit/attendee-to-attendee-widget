import React from 'react'
import {
  Chat,
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator
} from 'stream-chat-react'
import CustomChannelPreview from '../ChannelList/CustomChannelPreview'

import style from './style.module.scss'

const MessagesList = ({ user, chatClient }) => {
  const filters = {
    type: 'messaging',
    //members: { $in: [user.idpUserId] },
    id: { $nin: [`${user.idpUserId}-help`, `${user.idpUserId}-qa`] }
  }
  const sort = {
    last_message_at: -1,
  }
  const options = {
    watch: true,
    limit: 10
  }

  if (!chatClient) {
    return <LoadingIndicator />
  }

  return (
    <div className={style.channelsListWrapper}>
      <Chat client={chatClient}>
        <ChannelList
          key={`channel-list-users`}
          filters={filters}
          options={options}
          sort={sort}
          List={ChannelListMessenger}
          Preview={CustomChannelPreview}
          //EmptyStateIndicator={CustomEmptyStateIndicator}
          //LoadingIndicator={CustomLoadingIndicator}
          setActiveChannelOnMount={false}
          me={user}
        />
      </Chat>
    </div>
  )
}

export default MessagesList
