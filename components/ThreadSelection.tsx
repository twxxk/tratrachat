'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'

export default function ThreadSelection() {
  const uniqueId = nanoid()

  const router = useRouter()

  const handleFormSubmission = (formData: FormData) => {
    let threadId = formData.get("threadId");

    // start with the new Id if not specified
    if (!threadId) threadId = uniqueId

    router.push('/chat/' + threadId)
  }

    return (
        <>
            {/* Current Limitation: Messages are not persistent. Users cannot see the message history. */}
            <h2><Link href='/chat/test'>Join Test Chat Room</Link></h2>
            <br />
            &lt;-- (work in progress)<br />
            <Link href={'/chat/' + uniqueId}>New Chat</Link>
            <br />
            <form action={handleFormSubmission}>
                <input type="text"
                    id="threadId" name="threadId"
                    placeholder="Thread ID"
                />
                <button type="submit">Join</button>
            </form>
            --&gt;
        </>
    )
}
