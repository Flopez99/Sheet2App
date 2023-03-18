import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import UserAppsList from './UserAppsList';

function MyApps({ userEmail }) {
  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          My Apps
        </Typography>
      </Box>
      <UserAppsList userEmail={userEmail} />
    </Container>
  );
}

export default MyApps;
