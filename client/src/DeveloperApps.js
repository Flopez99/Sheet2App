import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

function DeveloperApps() {
  return (
    <main>
      <Container>
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Developer Dashboard
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Manage Apps
              </Typography>
              <Typography variant="body1" paragraph>
                Create, edit and manage your apps connected to Google Sheets.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  to="/myapps"
                  variant="contained"
                  color="primary"
                >
                  My Apps
                </Button>
                <Button
                  component={Link}
                  to="/createapp"
                  variant="contained"
                  color="primary"
                >
                  Create New App
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Switch to End User
              </Typography>
              <Typography variant="body1" paragraph>
                View your apps from an end user's perspective.
              </Typography>
              <Button
                component={Link}
                to="/enduser"
                variant="contained"
                color="secondary"
              >
                Go to End User Mode
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

export default DeveloperApps;
