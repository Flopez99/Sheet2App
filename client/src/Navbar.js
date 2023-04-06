import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import {gapi} from 'gapi-script';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';



const clientId = '144862274224-ji7vp538h3o8cdcp9t24actdpk7vqqjg.apps.googleusercontent.com';

function Navbar(props) {
  const navigate = useNavigate();
  console.log(props);
  
  function handleSignOut(event) {
    navigate('/', { state: 'Logged Out' });
  }

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: '',
      });
    }

    gapi.load('client:auth2', start);
  });

  return (
    <AppBar position="relative">
      <Toolbar>
      <IconButton edge="start" color="inherit" aria-label="home" sx={{ mr: 2 }} onClick={() => navigate('/developer')}>
        <HomeIcon />
      </IconButton>
        <Typography variant="h6" flexGrow={1}>
          Sheet2App
        </Typography>
        {Object.keys(props.user).length !== 0 && (
          <Button color="inherit" onClick={(e) => handleSignOut(e)}>
            Log Out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
