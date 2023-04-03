import React from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import UserAppsList from './UserAppsList';

function EndUserApps({ userEmail, isDeveloper }) {
  return (
    <main>
      <Box sx={{ flexGrow: 1, paddingTop: 3, paddingBottom: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 2,
            }}
          >
            {isDeveloper && (
              <Button component={Link} to="/developer" variant="contained">
                Switch to Developer
              </Button>
            )}
            <Typography variant="h2" color="textPrimary">
              End User
            </Typography>
            <Button variant="contained" color="secondary">Button</Button>
          </Box>
          <Paper elevation={4}>
            <UserAppsList userEmail={userEmail} endUser={true} />
          </Paper>
        </Container>
      </Box>
    </main>
  );
}

export default EndUserApps;
