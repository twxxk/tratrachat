'use client'

import React, { useEffect, useState } from 'react';
import { useChannel, usePresence } from "ably/react"
import styles from './ChatBox.module.css';

export default function ChatBox() {

  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [reverseTranslatedText, setReverseTranslatedText] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;
  const reverseTranslatedTextIsEmpty = reverseTranslatedText.trim().length === 0;

  const { channel, ably } = useChannel("chat-demo", (message) => {
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

  const translateText = async (messageText) => {
    const query_params = new URLSearchParams({text: messageText}); 
    const translateData = await fetch('/api/deepl?' + query_params)
    const responseText = await translateData.text()
    // console.log(responseText + 'aaa')
    const translatedText = JSON.parse(responseText).text
    // console.log("ab"+translatedText);

    return translatedText
  }

  const previewMessage = async (event) => {
    setTranslatedText('...')
    setReverseTranslatedText('')
    const translatedText = await translateText(messageText)
    setTranslatedText(translatedText)
    const reverseTranslatedText = await translateText(translatedText)
    setReverseTranslatedText(reverseTranslatedText)

    // inputBox.focus();
  }

  // Send Message to the server
  const sendChatMessage = async (messageText) => {   
    channel.publish({ name: "chat-message", data: {sourceText: messageText, translatedText: translatedText} });
    setMessageText("");
    setTranslatedText("")
    setReverseTranslatedText("")
    inputBox.focus();
  }

  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  }

  const handleKeyPress = (event) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    // sendChatMessage(messageText);
    previewMessage(messageText);
    event.preventDefault();
  }

  /**
   * Currently just send a text
   */
  const sendEmoji = async (emojiText) => {
    channel.publish({ name: "chat-message", data: {sourceText: emojiText} });
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
  const { presenceData, updateStatus } = usePresence("room", {'status':'available'}, (member) => {
    // action: 'enter' or 'leave'
    // `action: ${member.action} clientId: ${member.clientId}`
  });

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

          return (<>{prefix}<span className="" key={member.id}>{user}</span></>)
        })}
      </div>
    </div>
  )
}