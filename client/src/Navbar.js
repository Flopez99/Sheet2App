import React from 'react'
import {Stack, Button, Link, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps';
import LoginButton from "./components/Login";
import LogoutButton from "./components/Logout";
import {useEffect} from 'react';
import {gapi} from 'gapi-script';

const clientId = "144862274224-ji7vp538h3o8cdcp9t24actdpk7vqqjg.apps.googleusercontent.com"

function Navbar() {

  useEffect(() => {

    function start() {
      gapi.client.init({
        clientId:clientId,
        scope:""
      })
    };

    gapi.load('client:auth2', start)
  })


  return (
    <AppBar position = 'relative'>
    <Toolbar>
        <LoginButton/>
        <LogoutButton/>
        <AppsIcon /> {/* Our logo is here    */}
        <Typography variant = 'h1' flexGrow={1} align = "center">
            Sheet2App
        </Typography>
    </Toolbar>
    </AppBar>
  )
}

export default Navbar
