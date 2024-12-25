import React, { useState, useContext, useEffect } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { query, collection, getDoc, getDocs, where, doc, setDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setmessageId, messageId, chatVisible, setChatVisible } = useContext(AppContext);
    const [user, setUser] = useState("");
    const [showSearch, setShowSearch] = useState(false);


    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                if (input === '') return;
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    //console.log(querySnap.docs[0].data());
                    let userExist = false
                    chatData.map((user)=>{
                        if(user.rId === querySnap.docs[0].data().id){
                            userExist = true;
                        }  
                    })
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                   
                } else {
                    //console.log('No matching users found');
                    setUser(null);
                }
            }
            else{
                setShowSearch(false);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    const addChat = async () => {
        const messagesRef = collection(db,"messages");
        // new collection is created whern there is chat b/w two users
        const chatsRef = collection(db,"chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef,{
            createAt:serverTimestamp(),
            messages:[]
        });

        await updateDoc(doc(chatsRef,user.id),{
            chatsData:arrayUnion({
                messageId:newMessageRef.id,
                lastMessage:"",
                rId:userData.id,
                updatedAt:Date.now(),
                messageSeen:true
            })
        });
        await updateDoc(doc(chatsRef,userData.id),{
            chatsData:arrayUnion({
                messageId:newMessageRef.id,
                lastMessage:"",
                rId:user.id,
                updatedAt:Date.now(),
                messageSeen:true
            })
        });

        const uSnap = await getDoc(doc(db,'users',user.id));
        const uData = uSnap.data();
        setChat({
            messageId:newMessageRef.id,
            lastMessage:"",
            rId:user.id,
            updatedAt:Date.now(),
            messageSeen:true,
            userData:uData
        })

        setShowSearch(false)
        setChatVisible(true)

        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    }
    const setChat = async (item) => {

        try {
            setmessageId(item.messageId);
            setChatUser(item)
            const userChatsRef = doc(db,'chats',userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
            userChatsData.chatsData[chatIndex].messageSeen = true;
            await updateDoc(userChatsRef,{
                chatsData:userChatsData.chatsData
            })
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
        }
        //console.log(item)
    }
    // // Filter chatData to only include unique users
    // const uniqueChatData = chatData.filter((value, index, self) =>
    //     index === self.findIndex((t) => (
    //         t.userData.id === value.userData.id
    //     ))
    // );

    useEffect(()=>{
        const updateChatUserData = async () => {
            if(chatUser){
                const userRef = doc(db,"users",chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev=>({...prev,userData:userData}))
            }
        }
        updateChatUserData();
    },[chatData])

    return (
        <div className={`ls ${chatVisible ? "hidden": ""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                {userData?.avatar ? (
                <img src={userData.avatar} alt="User Avatar" className="user-avatar" />
                 ) : (
                 <img src={assets.logo} alt="" className="user-avatar" />
                )}
                <p className='user-name'>{userData?.name || "ChatApp"}</p>
                    {/* <img src={assets.logo} className='logo' alt="" /> */}
                    <div className="menu">
                        <img src={assets.menu_icon} alt=""/>
                        <div className="sub-menu">
                                <p onClick={() => navigate('/profile')}>Edit Profile</p>
                                <hr />
                                <p>New Group</p>
                                <hr/>
                                <p onClick={() => navigate('/')}>Logout</p>
                            </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='Search here..' />
                </div>
            </div>
            <div className="ls-list">
                {/* <div className="friends">
            <img src={assets.profile_img} alt="" />
            <div>
                <p>Richard Sanford</p>
                <span>Hello, How are you?</span>
            </div>
        </div> */}
                 {showSearch && user
                    ? <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                    : chatData && chatData.length > 0
                        ? chatData.map((item, index) => (
                            <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messageId ? "":"border"}`}>
                                <img src={item.userData.avatar} alt="" />
                                <div>
                                    <p>{item.userData.name}</p>
                                    <span>{item.lastMessage}</span>
                                </div>
                            </div>
                        ))
                        : console.log("No chats available")
                }
                
            </div>
        </div>
    )
}

export default LeftSidebar
