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
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 2,
            }}
          >
            {isDeveloper && (
              <Button component={Link} to="/developer" variant="contained" color ="secondary">
                Switch to Developer
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} /> 
              <Typography
                variant="h3"
                color="textPrimary"
                sx={{paddingBottom: '0.5rem'}}
              >
                End User
              </Typography>
            <Box sx={{ flexGrow: 2 }} /> 
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
