'use client'

import React, { useEffect, useState } from 'react';
import { useChannel } from "ably/react"
import styles from './ChatBox.module.css';

export default function ChatBox() {

  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const { channel, ably } = useChannel("chat-demo", (message) => {
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

  // Send Message to the server
  const sendChatMessage = async (messageText) => {
    const query_params = new URLSearchParams({text: messageText}); 
    const translateData = await fetch('/api/deepl?' + query_params)
    const responseText = await translateData.text()
    // console.log(responseText + 'aaz')
    const translatedText = JSON.parse(responseText).text
    // console.log("ab"+translatedText);
    
    channel.publish({ name: "chat-message", data: {sourceText: messageText, translatedText: translatedText} });
    setMessageText("");
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
    sendChatMessage(messageText);
    event.preventDefault();
  }

  const messages = receivedMessages.map((message, index) => {
    const author = message.connectionId === ably.connection.id ? "me" : "other";
    // console.log(message.data)
    const {sourceText, translatedText} = message.data;
    return <span key={index} className={styles.message} data-author={author}>{sourceText}<br />{translatedText}</span>;
  });

  useEffect(() => {
    messageEnd.scrollIntoView({ behaviour: "smooth" });
  });

  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        <div ref={(element) => { messageEnd = element; }}></div>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => { inputBox = element; }}
          value={messageText}
          placeholder="Type a message..."
          onChange={e => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        ></textarea>
        <button type="submit" className={styles.button} disabled={messageTextIsEmpty}>Send</button>
      </form>
    </div>
  )
}