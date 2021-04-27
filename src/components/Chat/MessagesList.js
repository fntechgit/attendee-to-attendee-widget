import React from 'react'
import {
  Chat,
  ChannelList,
  LoadingIndicator,
} from 'stream-chat-react'

import 'stream-chat-react/dist/css/index.css'

//const filters = { type: 'messaging', members: { $in: ['nameless-hall-2'] } }
const filters = { type: 'messaging' }
const sort = { last_message_at: -1 }

const MessagesList = ({ user, chatClient }) => {
  if (!chatClient) {
    return <LoadingIndicator />
  }

  return (
    <Chat client={chatClient} theme='messaging light'>
      <ChannelList filters={filters} sort={sort} />
    </Chat>
  )
}

export default MessagesList
