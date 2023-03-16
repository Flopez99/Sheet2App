import React from 'react'
import {useEffect, useState} from 'react'
import jwt_decode from "jwt-decode"
import { useNavigate } from 'react-router-dom'
function LandingPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({})
    function handleCallBackResponse(response){
        console.log("Encoded JWT Id token: " + response.credential)
        var userObject = jwt_decode(response.credential);
        console.log(userObject)
        setUser(userObject)
        navigate("/developer", {state: userObject});
    }
    useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
            client_id: "144862274224-ji7vp538h3o8cdcp9t24actdpk7vqqjg.apps.googleusercontent.com",
            callback: handleCallBackResponse
        });

        google.accounts.id.renderButton(
            document.getElementById('signInDiv'),
            {them: "outline", size: "large"}
        )
        
    }, [])
    //if we have user show sign in button, which would move them to the developer side
  return (
    <div>
        <div id = "signInDiv"></div>
    </div>
  )
}

export default LandingPage
