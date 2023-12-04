'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { FormEvent } from 'react';

export default function ThreadSelection() {
  const uniqueId = nanoid()

  const router = useRouter()

  // The attendee should be shared the chat URL from others
//   const handleFormSubmission = (formData: FormData) => {
//     let threadId = formData.get("threadId");

//     // start with the new Id if not specified
//     if (!threadId) threadId = uniqueId

//     router.push('/chat/' + threadId)
//   }

    return (
        <div>
            {/* Current Limitation: Messages are not persistent. Users cannot see the message history. */}
            <h2><Link href='/chat/test'>Join Test Room</Link></h2>
            <br />
            <h2><Link href={'/chat/' + uniqueId}>Create New Room</Link></h2>
            {/* <form action={handleFormSubmission}>
                <input type="text"
                    id="threadId" name="threadId"
                    placeholder="Thread ID"
                />
                <button type="submit">Join</button>
            </form> */}
        </div>
    )
}
