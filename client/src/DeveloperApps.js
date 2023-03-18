import React from 'react'
import {IconButton, Stack, Button, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import { Link } from 'react-router-dom';
import UserAppsList from './UserAppsList'; // Import UserAppsList component

function DeveloperApps({ userEmail }) {
  return (
    <main>
        <div>
            <Container >
                <Stack direction ="row" justifyContent="space-evenly">
                    <Button component={Link} to="/enduser">Switch to End User</Button>
                    <Typography variant = "h2" color = "textPrimary">Developer</Typography>
                    <Button component={Link} to="/createapp">Create an App</Button>
                </Stack>
            </Container>
        </div>

        {/* Include UserAppsList component here */}
        <Container>
          <Typography variant="h3" gutterBottom>
            My Apps
          </Typography>
          <UserAppsList userEmail={userEmail} />
        </Container>
    </main>
  )
}

export default DeveloperApps