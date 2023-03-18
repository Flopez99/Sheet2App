import React from 'react'
import {useEffect, useState} from 'react'
import jwt_decode from "jwt-decode"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function LandingPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({})
    const [isDeveloper, setIsDeveloper] = useState(false);

    function handleCallBackResponse(response){
        console.log("Encoded JWT Id token: " + response.credential)
        var userObject = jwt_decode(response.credential);
        //console.log(userObject)
        setUser(userObject)

        const email = userObject.email;

        //Request the backend to see if the email is in the global devs list
        axios.get(`http://localhost:8080/api/check-email?email=${email}`).then((response) => {
            setIsDeveloper(response.data.isDeveloper);
            if (response.data.isDeveloper) {
              navigate('/developer', { state: userObject });
            } else {
              navigate('/enduser', { state: userObject });
            }
          }).catch((error) => {
            console.error(error);

          });
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
