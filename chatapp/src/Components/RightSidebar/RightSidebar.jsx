import React, { useContext, useState, useEffect } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    // Filter out images and documents
    let tempFiles = [];
    messages.forEach((msg) => {
      if (msg.image || msg.file) {
        tempFiles.push({
          url: msg.image || msg.file,
          type: msg.image ? 'image' : 'document',
          name: msg.fileName,
        });
      }
    });
    setMediaFiles(tempFiles);
  }, [messages]);

  return chatUser ? (
    <div className="rs">
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}
          {chatUser.userData.name}
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media & Documents</p>
        <div className="media-grid">
          {mediaFiles.map((file, index) => (
            <div
              key={index}
              className="media-item"
              onClick={() => window.open(file.url)}
            >
              {file.type === 'image' ? (
                <img src={file.url} alt="" className="media-thumbnail" />
              ) : (
                <div className="document-icon">
                  <img
                    src={
                      file.name.endsWith('.pdf')
                        ? assets.pdf_icon
                        : file.name.endsWith('.doc') || file.name.endsWith('.docx')
                        ? assets.word_icon
                        : file.name.endsWith('.zip') || file.name.endsWith('.rar')
                        ? assets.zip_icon
                        : assets.default_file_icon
                    }
                    alt="document icon"
                  />
                  <p className="document-name">{file.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className="rs">
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;
