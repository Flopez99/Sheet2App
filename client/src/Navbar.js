import React from 'react'
import {Stack, Button, Link, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps';
function Navbar() {
  return (
    <AppBar position = 'relative'>
    <Toolbar>
        <AppsIcon /> {/* Our logo is here    */}
        <Typography variant = 'h1' flexGrow={1} align = "center">
            Sheet2App
        </Typography>
    </Toolbar>
    </AppBar>
  )
}

export default Navbar
