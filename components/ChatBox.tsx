'use client'

import React, { KeyboardEvent, useEffect, useState } from 'react';
import { ChannelParameters, useChannel, usePresence } from "ably/react"
import styles from './ChatBox.module.css';

const ablyChannelNamespace = process.env.ABLY_NAMESPACE || 'tratrachat';
const ablyEventName = 'chat-message'

export function shareUrl() {
  const message = 'Share this URL with other attendees'
  prompt(message, location.href)
}

export default function ChatBox(params: { threadId: string }) {
  const threadId = params.threadId
  // console.log('threadId=', threadId)
  const ablyChannelName = ablyChannelNamespace + ':' + threadId
  
  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [reverseTranslatedText, setReverseTranslatedText] = useState("");
  const [receivedMessages, setMessages] = useState([]);

  const messageTextIsEmpty = messageText.trim().length === 0;
  const [lastPreviewedText, setLastPreviewedText] = useState("");
  const currentMessageIsPreviewed = !messageTextIsEmpty && messageText === lastPreviewedText

  // https://github.com/ably-labs/ably-nextjs-fundamentals-kit/blob/main/app/presence/presence-client.tsx
  // https://ably.com/tutorials/how-to-ably-react-hooks
  const { presenceData } = usePresence(ablyChannelName);
  // const presenceData = []; // only for debug

  // Making sure the focus is on the latest message
  useEffect(() => {
    if (!messageEnd)
      return;
    messageEnd.scrollIntoView({ behaviour: "smooth" });
  });

  // https://zenn.dev/qaynam/articles/c4794537a163d2
  useEffect(() => {
    // https://dagashi.pw/react18-useeffect-twice/
    //  console.log('mounting ChatBox')

    const ablyCloser = () => {
      console.log('ably closer is called. state=' + ably.connection.state);
      if (ably && ably.connection.state === "connected" ) {
        // console.log('closing connected ably.');
        ably.close();
      }
    };
  
    // window.addEventListener('beforeunload', ablyCloser);
    return () => {
      // console.log('unmounting ChatBox')
      ablyCloser(); // may not need this
      // window.removeEventListener('beforeunload', ablyCloser);
    };
  }, []); 

  // console.log(`[?rewind=100]${ablyChannelName}`)
  // XXX [?rewind=10] does not work for some reason
  // channel.setOptions({params: {rewind: '10'}})
  // const options:ChannelParameters = {channelName: `${ablyChannelName}`, options: {params: {rewind: '10'}}}
  const options:ChannelParameters = {channelName: ablyChannelName}
  const { channel, ably } = useChannel(options,
  (message) => {
    // handler for new messages
    // https://ably.com/tutorials/how-to-ably-react-hooks#tutorial-step-4
    // https://ably.com/docs/channels/options/rewind
    // console.log(message)
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });
  // XXX channel or ably might be Error - need to handle https://ably.com/docs/getting-started/react#error-handling

  const [isHistoryCalled, setIsHistoryCalled] = useState(false)
  const handleHistory = (paginatedResult) => {
    if (isHistoryCalled) {
      return;
    }
    setIsHistoryCalled(true);

    // console.log('len=' + paginatedResult.items.length);
    // direction:backwards gets the latest message as the first item
    // stable reverse
    setMessages(paginatedResult.items.slice().reverse());
  }
  channel.history({limit: 10}).then(handleHistory).catch((err) => {
    console.log('err to get channel history', err)
  })

  /**
   * Translate with deepl
   */
  const translateText = async (messageText) => {
    const query_params = new URLSearchParams({text: messageText}); 

    const translateData = await fetch('/api/deepl?' + query_params)
    const responseText = await translateData.text()
    // console.log(responseText + 'aaa')
    const translatedText = JSON.parse(responseText).text
    // console.log("ab"+translatedText);

    return translatedText
  }

  /**
   * Preview translated messages
   */
  const previewMessage = async (event) => {
    if (messageText.trim().length === 0) {
      console.log('no message to preview')
      return false;
    }

    setTranslatedText('...')
    setReverseTranslatedText('')
    const translatedText = await translateText(messageText)
    setTranslatedText(translatedText)
    const reverseTranslatedText = await translateText(translatedText)
    setReverseTranslatedText(reverseTranslatedText)

    setLastPreviewedText(messageText)
  }

  /**
   * Send user message to the server
   */
  const sendChatMessage = async (messageText) => {
    channel.publish({ name: ablyEventName, data: {sourceText: messageText, translatedText: translatedText} });

    setMessageText("");
    setTranslatedText("")
    setReverseTranslatedText("")
    inputBox.focus();
  }

  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  }

  /**
   * Textarea Key event
   */
  const handleKeyPress = (event:KeyboardEvent) => {
    // console.log(messageText, messageTextIsEmpty)
    // console.log(`last=${lastPreviewedText} now=${messageText}`)

    // If not enter key or shift-enter, do anything
    if (event.charCode !== 13 || messageTextIsEmpty || event.shiftKey) {
      return;
    }

    if (currentMessageIsPreviewed || event.ctrlKey) {
      // hidden feature - send directly with ctrl + enter
      sendChatMessage(messageText); 
    }
    else {
      // translate first
      previewMessage(messageText);
    }

    event.preventDefault();
  }

  /**
   * Currently just send a text
   */
  const sendEmoji = async (emojiText) => {
    channel.publish({ name: ablyEventName, data: {sourceText: emojiText} });
  }

  const handleLike = (event) => {
    sendEmoji('👍')
  }

  const handleWatch = (event) => {
    sendEmoji('👀')
  }

  /**
   * show received messages
   * @param messages {data: {sourceText, translatedText}, connectionId, clientId, id, name, data, timestamp }
   */
  const messages = receivedMessages.map((message, index) => {
    // console.log(message)
    const isMyMessage = message.connectionId === ably.connection.id
    const author = isMyMessage ? "me" : `${message.clientId}(${message.connectionId})`;
    const {sourceText, translatedText} = message.data;
   
    let sep = translatedText ? <br /> : ''
    const timeString = new Date(message.timestamp).toLocaleString()
    // const messageWrapperClassName = isMyMessage ? styles.myMessageWrapper : styles.messageWrapper 
    const messageClassName = isMyMessage ? styles.myMessage : styles.message

    // return <span key={index} className={messageWrapperClassName}>
    //   <span key={index} className={messageClassName} title={message.clientId}>
    //     {sourceText}{sep}{translatedText}
    //   </span>
    //   <span key={index} className={styles.time}>{timeString}</span>
    // </span>
    return <>
      <span key={index} className={messageClassName} title={`${timeString} by ${author}`}>
        {sourceText}{sep}{translatedText}
      </span>
    </>
  });

  return (
    <div className={styles.chatHolder}>
      {/* Chat Log Area */}
      <div className={styles.chatText}>
        {messages}
        <div ref={(element) => { messageEnd = element; }}></div>
      </div>

      {/* UI Controls */}
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => { inputBox = element; }}
          value={messageText}
          placeholder="Type a message here..."
          onChange={e => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        ></textarea>
        {/* Preview before Send */}
        <button type="button" className={styles.button} disabled={currentMessageIsPreviewed} onClick={previewMessage} title="Preview translations before sending your message">TraTra</button>
        <button type="submit" className={styles.button + ' ' + styles.previewbutton} disabled={!currentMessageIsPreviewed}>Send</button>
        <textarea
          value={translatedText + '\n' + reverseTranslatedText}
          className={styles.previewarea}
          disabled
        ></textarea>
        <button type="button" className={styles.button} onClick={handleLike}>👍</button>
        <button type="button" className={styles.button} onClick={handleWatch}>👀</button>
      </form>

      {/* Active Member List */}
      <div className={styles.membersWrapper}>
        <div>
          <strong>Members:</strong>&nbsp;
          {presenceData.map((member, index: number) => {
            const prefix = index !== 0 ? ', ' : ''
            const user = member.clientId + (member.connectionId === ably.connection.id ? "(me)" : '');
            return (
              <span className="" key={member.id}>
                {prefix}
                <span title={'connectionId=' + member.connectionId}>{user}</span>
              </span>
            )
          })}
        </div>
        <div>
          <button onClick={shareUrl}>Share</button>
        </div>
      </div>
    </div>
  )
}