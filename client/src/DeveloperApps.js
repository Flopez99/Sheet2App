import React from 'react'
import {IconButton, Stack, Button, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import { Link } from 'react-router-dom';
function DeveloperApps() {
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
    </main>
  )
}

export default DeveloperApps
