'use client'

import React, { KeyboardEvent, useEffect, useState } from 'react';
import { useChannel, usePresence } from "ably/react"
import styles from './ChatBox.module.css';

const ablyChannelNamespace = 'tratrachat'
const ablyEventName = 'chat-message'

export default function ChatBox(params: { threadId: string }) {
  const threadId = params.threadId
  // console.log('threadId=', threadId)
  // const ablyChannelName = ablyChannelNamespace + ':' + threadId
  const ablyChannelName = ablyChannelNamespace
  
  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [reverseTranslatedText, setReverseTranslatedText] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;
  const reverseTranslatedTextIsEmpty = reverseTranslatedText.trim().length === 0;

  /**
   * Get message history (max=100) from ably, but it does not work for some reason
   * https://ably.com/blog/channel-rewind
   */
  // console.log(`[?rewind=100]${ablyChannelName}`)
  const { channel, ably } = useChannel(`[?rewind=1]${ablyChannelName}`, (message) => {
    // https://ably.com/tutorials/how-to-ably-react-hooks#tutorial-step-4
    // https://ably.com/docs/channels/options/rewind
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

  // https://zenn.dev/qaynam/articles/c4794537a163d2
  useEffect(() => {
    const ablyCloser = () => {
      console.log('ably closer is called. state=' + ably.connection.state);
      if (ably && ably.connection.state === "connected" ) {
        console.log('closing connected ably.');
        ably.close();
      }
    };
  
    window.addEventListener('beforeunload', ablyCloser);
    return () => {
      ablyCloser(); // may not need this
      window.removeEventListener('beforeunload', ablyCloser);
    };
  }, []);
  
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
    setTranslatedText('...')
    setReverseTranslatedText('')
    const translatedText = await translateText(messageText)
    setTranslatedText(translatedText)
    const reverseTranslatedText = await translateText(translatedText)
    setReverseTranslatedText(reverseTranslatedText)

    // inputBox.focus();
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
    // If not enter key or shift-enter, do anything
    if (event.charCode !== 13 || messageTextIsEmpty || event.shiftKey) {
      return;
    }

    if (event.ctrlKey) {
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
    const author = message.connectionId === ably.connection.id ? "me" : "other";
    const {sourceText, translatedText} = message.data;

    let html
    if (translatedText) {
      html = <span key={index} className={styles.message} data-author={author}>{sourceText}<br />{translatedText}</span>;
    }
    else
    {
      html = <span key={index} className={styles.message} data-author={author}>{sourceText}</span>;
    }

    return html
  });

  // https://github.com/ably-labs/ably-nextjs-fundamentals-kit/blob/main/app/presence/presence-client.tsx
  // https://ably.com/tutorials/how-to-ably-react-hooks
  const { presenceData } = usePresence(ablyChannelName);

  // Making sure the focus is on the latest message
  useEffect(() => {
    messageEnd.scrollIntoView({ behaviour: "smooth" });
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
        <button type="button" className={styles.button} disabled={messageTextIsEmpty} onClick={previewMessage} title="Preview translations before sending your message">TraTra</button>
        <button type="submit" className={styles.button + ' ' + styles.previewbutton} disabled={reverseTranslatedTextIsEmpty}>Send</button>
        <textarea
          value={translatedText + '\n' + reverseTranslatedText}
          className={styles.previewarea}
          disabled
        ></textarea>
        <button type="button" className={styles.button} onClick={handleLike}>👍</button>
        <button type="button" className={styles.button} onClick={handleWatch}>👀</button>
      </form>

      {/* Active Member List */}
      <div>
        <strong>Members:</strong>&nbsp;
        {presenceData.map((member, index: number) => {
          const prefix = index !== 0 ? ', ' : ''
          const user = member.connectionId + (member.connectionId === ably.connection.id ? "(me)" : '');

          return (<span className="" key={member.id}>{prefix}{user}</span>)
        })}
      </div>
    </div>
  )
}