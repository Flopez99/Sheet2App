import { GoogleLogout } from 'react-google-login'

const clientId = "144862274224-ji7vp538h3o8cdcp9t24actdpk7vqqjg.apps.googleusercontent.com"

function Logout() {

    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! Current User: ", res.profileObj);
    }

    return(
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText='Logout'
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default Logout;