import React, { useContext, useEffect, useState } from 'react';
import './ProfileUpdate.css';
import assests from '../../assets/assets';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  const nav = useNavigate();
  const [image, setImage] = useState(null); 
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [uid, setUid] = useState('');
  const [prevImage, setPrevImage] = useState('');

  const { setUserData } = useContext(AppContext);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error('Upload profile picture');
        return;
      }

      const docRef = doc(db, 'users', uid);
      let imgUrl = prevImage;

      if (image) {
        imgUrl = await upload(image);
        setPrevImage(imgUrl);
      }

      await updateDoc(docRef, {
        avatar: imgUrl,
        bio: bio,
        name: name,
      });

      const snap = await getDoc(docRef);
      setUserData(snap.data());

      // Navigate to the login page after saving
      nav('/chat');
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || '');
          setBio(userData.bio || '');
          setPrevImage(userData.avatar || '');
        }
      } else {
        nav('/');
      }
    });
  }, [nav]);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={handleProfileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept="image/png, image/jpg, image/jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || assests.avatar_icon}
              alt="Profile"
            />
            Upload Profile Image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          />
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImage || assests.logo_icon}
          alt="Preview"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
