import React, { useContext, useEffect, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import upload from '../../lib/upload';

const ChatBox = () => {
  const { userData, messageId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messageId) {
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }

    setInput("");
  };

  const sendFile = async (e) => {
    try {
      const file = e.target.files[0];
      const fileUrl = await upload(file);

      if (fileUrl && messageId) {
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            file: fileUrl,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,  // Convert size to KB for display
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            userChatData.chatsData[chatIndex].lastMessage = file.name;
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;

    if (hour > 12) {
      return `${formattedHour - 12}:${formattedMinute} PM`;
    } else {
      return `${formattedHour}:${formattedMinute} AM`;
    }
  };

  useEffect(() => {
    if (messageId) {
      const unSub = onSnapshot(doc(db, 'messages', messageId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messageId]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          className="arrow"
          alt=""
        />
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg.file ? (
              <div className="file-msg">
                {/* Display an icon based on file type */}
                <img
                  src={
                    msg.fileName.endsWith('.pdf')
                      ? assets.pdf_icon
                      : msg.fileName.endsWith('.doc') || msg.fileName.endsWith('.docx')
                      ? assets.word_icon
                      : msg.fileName.endsWith('.zip') || msg.fileName.endsWith('.rar')
                      ? assets.zip_icon
                      : assets.default_file_icon
                  }
                  alt="file icon"
                  className="file-icon"
                />
                <div className="file-info">
                  <p className="file-name">{msg.fileName}</p>
                  <p className="file-size">{msg.fileSize}</p>
                  <div className="file-actions">
                    <a href={msg.file} target="_blank" rel="noopener noreferrer">
                      <button className="file-open-btn">Open</button>
                    </a>
                    <a href={msg.file} download={msg.fileName}>
                      <button className="file-save-btn">Save as...</button>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="msg">{msg.text}</p>
            )}

            <div>
              <img
                src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                alt=""
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <input
          onChange={sendFile}
          type="file"
          id="file"
          accept="image/*, .pdf, .doc, .docx, .zip"
          hidden
        />
        <label htmlFor="file">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
