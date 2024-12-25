import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase'
const Login = () => {

  const [currState, setCurrState] = useState("Sign Up");
  const [userName,setUserName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault(); // no reload after submitting form
    if(currState === "Sign Up"){
      try {
        signup(userName, email, password);
        setVerificationSent(true); // Indicate that a verification email was sent
        setUserName(""); // Clear the username field
        setEmail(""); // Clear the email field
        setPassword(""); // Clear the password field
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
    else{
      login(email,password);
    }
  }

  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className='logo'/>
      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>
         {currState}
        </h2>
        {currState === "Sign Up"?<input onChange={(e)=> setUserName(e.target.value)} value={userName} type="text" className="form-input" placeholder='Username' required/>:null}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className="form-input" placeholder='Email address' required/>
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className="form-input" placeholder='Password' required/>
        <button type='submit'>{currState === "Sign Up"?"Create Account":"Login now"}</button>
        {verificationSent && <p className="verification-message">A verification email has been sent to {email}. Please check your inbox.</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className="login-forgot">
        {currState === "Sign Up" ? <p className="login-toggle">Already have an account <span onClick={()=>setCurrState("Login")}>Login</span></p>:
        <p className="login-toggle">Create an account <span onClick={()=>setCurrState("Sign Up")}>click here</span></p>}
        {currState === "Login" ? <p className="login-toggle">Forgot Password ? <span onClick={()=>resetPass(email)}>reset here</span></p> : null}
        </div>
      </form>
    </div>
  )
}

export default Login
