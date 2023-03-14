import React from 'react'
import {IconButton, Stack, Button, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import { Link } from 'react-router-dom';
function EndUserApps() {
  return (
    <main>
        <div>
            <Container >
                <Stack direction ="row" justifyContent="space-evenly">
                    <Button component={Link} to="/">Switch to Developer</Button>
                    <Typography variant = "h2" color = "textPrimary">End User</Typography>
                    <Button>Button</Button>
                </Stack>
            </Container>
        </div>
    </main>
  )
}

export default EndUserApps
