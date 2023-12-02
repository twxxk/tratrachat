'use client'

// You can ignore warnings https://github.com/jaredwray/keyv/issues/45
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'
import ChatBox from './ChatBox'

export default function Chat() {

  const client = Ably.Realtime.Promise({ authUrl: '/api/ably' })

  return (
    <AblyProvider client={ client }>
      <ChatBox />
    </AblyProvider>
  )
} 