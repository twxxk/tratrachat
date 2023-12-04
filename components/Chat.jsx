'use client'

// You can ignore warnings https://github.com/jaredwray/keyv/issues/45
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'
import ChatBox from './ChatBox'
import { getUserName } from './UserSettings'

export default function Chat(params) {
  const threadId = params.threadId
  const userName = getUserName()

  // https://ably.com/docs/auth/token?lang=nodejs
  // console.log('calling api. username=' + userName);
  const client = Ably.Realtime.Promise({ authUrl: '/api/ably', authParams: {userName: userName} })

  return (
    <AblyProvider client={ client }>
      <ChatBox threadId={ threadId } />
    </AblyProvider>
  )
} 
