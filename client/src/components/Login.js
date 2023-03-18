import { GoogleLogin } from 'react-google-login'

const clientId = "144862274224-ji7vp538h3o8cdcp9t24actdpk7vqqjg.apps.googleusercontent.com"


function Login() {

    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! Current User: ", res.profileObj);
    }
    const onFailure = (res) => {
        console.log("LOGIN FAILED! Res: ", res);
    }

    return(
        <div id="signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText='Login'
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
            />
        </div>
    )
}

export default Login;