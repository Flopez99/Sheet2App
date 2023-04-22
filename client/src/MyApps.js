import React from 'react';
import { Container, Typography, Box, Paper, Button, Link as MuiLink} from '@mui/material';
import UserAppsList from './UserAppsList';
import { Link } from 'react-router-dom';

function MyApps({ userEmail }) {
  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4, display: 'flex',
              justifyContent: 'spacing-between',
              alignItems: 'center',
              }}>
      <Button component={Link} to="/developer" variant="contained" color ="primary">
        Switch to Developer
      </Button>
      <Box sx={{ flexGrow: 1 }} /> 
        <Typography variant="h3" sx={{letterSpacing: '2px'}}>
          My Apps
        </Typography>
      <Box sx={{ flexGrow: 2 }} />
      </Box>
      <Paper elevation={4}>
      <UserAppsList userEmail={userEmail} />
      </Paper>
    </Container>
  );
}

export default MyApps;
