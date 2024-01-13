import React from 'react'
import {Stack, Button, Typography, Container} from '@mui/material'
import { Link } from 'react-router-dom';

function DataSource() {
  return (
    <main>
        <div>
            <Container >
                <Stack direction ="row" justifyContent="space-evenly">
                    <Button component={Link} to="/createapp">Create App</Button>
                    <Typography variant = "h2" color = "textPrimary">DataSources</Typography>
                    <Button component={Link} to="/createdatasource">Create a DataSource</Button>
                </Stack>
            </Container>
        </div>
    </main>
  )
}

export default DataSource
