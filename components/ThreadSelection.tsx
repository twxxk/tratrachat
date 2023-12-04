import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { FormEvent } from 'react';
import styles from './ThreadSelection.module.css'

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
            <h2>2. Join Chat Room</h2>
            <ul className={styles.threads}>
                <li><Link href='/chat/test'>Test Room</Link></li>
                <li>
                    {/* Disable prefetching for the random link to reduce the chat room creation */}
                    <a href={randomRoomLink}>Create New Room</a>
                </li>
            </ul>
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
