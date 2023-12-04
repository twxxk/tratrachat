'use client'

// You can ignore warnings https://github.com/jaredwray/keyv/issues/45
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'
import ChatBox from './ChatBox'
import { useUserName } from './UserSettings'

export default function Chat(params) {
  const threadId = params.threadId
  // console.log(threadId)
  // XXX useEffectが呼ばれる前にこの関数は戻ってきて、ユーザー名が空文字列になる可能性がある。それによりpresenceに悪影響。
  const {userName} = useUserName();

  // https://ably.com/docs/auth/token?lang=nodejs
  console.log('calling api. username=' + userName);
  const client = Ably.Realtime.Promise({ authUrl: '/api/ably', authParams: {userName: userName} })

  return (
    <AblyProvider client={ client }>
      <ChatBox threadId={ threadId } />
    </AblyProvider>
  )
} 
