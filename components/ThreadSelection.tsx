import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { FormEvent } from 'react';

// https://stackoverflow.com/questions/59976409/next-js-using-random-properties-without-triggering-did-not-match-on-server-cli
export async function getServerSideProps() {
    return { uniqueId: nanoid() }
}

export default async function ThreadSelection() {
  const props = await getServerSideProps()
  const randomRoomLink = '/chat/' + props.uniqueId

//   const router = useRouter()
//  The attendee should be shared the chat URL from others
//   const handleFormSubmission = (formData: FormData) => {
//     let threadId = formData.get("threadId");

//     // start with the new Id if not specified
//     if (!threadId) threadId = uniqueId

//     router.push('/chat/' + threadId)
//   }

    return (
        <div>
            <h2><Link href='/chat/test'>Join Test Room</Link></h2>
            <br />
            <h2>
                {/* Disable prefetching for the random link to reduce the chat room creation */}
                <a href={randomRoomLink}>Create New Room</a>
            </h2>
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
