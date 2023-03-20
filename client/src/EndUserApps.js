import React from 'react'
import {IconButton, Stack, Button, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import { Link } from 'react-router-dom';
import UserAppsList from './UserAppsList';

function EndUserApps({userEmail,isDeveloper}) {
  return (
    <main>
        <div>
            <Container >
                <Stack direction ="row" justifyContent="space-evenly">
                    {isDeveloper && <Button component={Link} to="/developer">Switch to Developer</Button>}
                    <Typography variant = "h2" color = "textPrimary">End User</Typography>
                    <Button>Button</Button>
                </Stack>
            </Container>
        </div>
        <UserAppsList userEmail={userEmail} endUser={true}/>

    </main>
  )
}

export default EndUserApps
