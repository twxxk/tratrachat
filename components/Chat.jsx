'use client'

import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'
import ChatBox from './ChatBox.jsx'

export default function Chat() {

  const rnd = Math.random();
  // console.log('?rnd=' + rnd);
  const client = Ably.Realtime.Promise({ authUrl: '/api' + '?rnd=' + rnd })

  return (
    <AblyProvider client={ client }>
      <ChatBox />
    </AblyProvider>
  )
} 