'use client'

import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'
import ChatBox from './ChatBox.jsx'

export default function Chat() {

  const rnd = Math.random();
  const client = Ably.Realtime.Promise({ authUrl: '/api/ably' })

  return (
    <AblyProvider client={ client }>
      <ChatBox />
    </AblyProvider>
  )
} 