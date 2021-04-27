import React from 'react'
import {
  Chat,
  ChannelList,
  ChannelListMessenger,
  LoadingIndicator
} from 'stream-chat-react'

import style from './style.module.scss'

const MessagesList = ({ user, chatClient }) => {

  if (!chatClient) {
    return <LoadingIndicator />
  }

  return (
    <div className={style.widgetWrapper}>
      <Chat client={chatClient}>
        <ChannelList
          key={`channel-list-users`}
          filters={{
            type: 'messaging',
            //members: { $in: [user.idpUserId] },
            id: { $nin: [`${user.idpUserId}-help`, `${user.idpUserId}-qa`] }
          }}
          sort={{ last_message_at: -1 }}
          List={ChannelListMessenger}
          //Preview={CustomChannelPreview}
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
