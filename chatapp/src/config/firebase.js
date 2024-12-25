import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from "react-toastify";


const firebaseConfig = {
  apiKey: "YOUR API KEY",
  authDomain: "chat-app-gs-a39f8.firebaseapp.com",
  projectId: "chat-app-gs-a39f8",
  storageBucket: "chat-app-gs-a39f8.appspot.com",
  messagingSenderId: "257702329817",
  appId: "1:257702329817:web:1720f27bc8baf58ba02dc8"
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app);
const db = getFirestore(app);

const signup = async (username,email,password) => {
    try{
        // create new user
        const res = await createUserWithEmailAndPassword(auth,email,password);
        // store it in a variable
        const user = res.user;
        // store data in firestore
        // reference of our db && collection name && uid of user
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, There I am using Chat App",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
        await sendEmailVerification(user);
        toast.success("Verification email sent! Please check your inbox.");


    }catch(error){
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email,password) => {
    try{
        await signInWithEmailAndPassword(auth,email,password)
    }catch(error){
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
    
}

const resetPass = async (email) => {
    if(!email){
        toast.error("Enter your email");
        return null;
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef,where("email","==",email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent");
        }else{
            toast.error("Email doesn't exists");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
}

export {signup,login,logout,auth,db,resetPass}
