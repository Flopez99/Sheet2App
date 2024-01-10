import React from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link, Navigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DataSource from './DataSource';
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {useEffect, useState} from 'react'
import CreateView from './CreateView';
import DataSourceList from './DataSourceList';
import ViewsList from './ViewsList';
import Paper from '@mui/material/Box';

const theme = createTheme();


function EditApp(props) {//props.datasource contains datasource id needed to fill in page
 const [app, setApp] = useState({})
 const [appName, setAppName] = useState('');
 const [roleMembershipUrl, setRoleMembershipUrl] = useState('');
 const [published, setPublished] = useState({})
 const navigate = useNavigate();

 useEffect(async () => {
    await axios.get(`${process.env.SITE_URL}/app`, { params: {
        id: props.appId
    }})
    .then((res) =>{
        console.log("Got Datasource")
        console.log(res.data)

        setPublished(res.data.published);
        setAppName(res.data.app_name);
        setRoleMembershipUrl(res.data.role_membership_url);
        setApp(res.data)
    })
  }, []);

  const handleAppNameChange = (e) => {
    setAppName(e.target.value);
  };

  const handleRoleMembershipUrlChange = (e) => {
    setRoleMembershipUrl(e.target.value);
  };

  const handlePublishedChange = (e) => {
    setPublished(e.target.checked);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`${process.env.SITE_URL}/updateApp`, {
      id: props.appId,
      app_name: appName,
      role_membership_url: roleMembershipUrl,
      published: published
    }).then((response) => {
      alert(response.data.message);
    })
    .catch((error) => {
      alert("Error updating app");
    });
  };

  const handleDeleteApp = async () => {
    if (window.confirm('Are you sure you want to delete this app?')) {
      await axios.post(`${process.env.SITE_URL}/deleteApp`, {
        id: props.appId
      })
      .then((response) => {
        alert(response.data.message);
        navigate('/myapps')
      })
      .catch((error) => {
        alert("Error deleting app");
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Edit App
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <TextField
                  name="App Name"
                  value={appName || ''}
                  required
                  fullWidth
                  id="appName"
                  label="App Name"
                  autoFocus
                  onChange={handleAppNameChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={roleMembershipUrl || ''}
                  fullWidth
                  id="rolemembershipsheet"
                  label="Role Membership Sheet URL"
                  name="rolemembershipsheet"
                  onChange={handleRoleMembershipUrlChange}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  component={Link}
                  to="/createdatasource"
                  state={props.appId}
                  type="AddDataSource"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Add Data
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  component={Link}
                  to="/view"
                  state={props.appId}
                  type="AddView"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Add View
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={published}
                    onChange={handlePublishedChange}
                    name="published"
                    color="primary"
                  />
                }
                label="Published"
                sx={{ mt: 2 }}
              />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update
            </Button>
            <Button
              onClick={handleDeleteApp}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: 'error.main' }}
            >
              Delete App
            </Button>
          </Box>
        </Box>
      </Container>
      <Container>
        <Paper elevation={4}>
        {Object.keys(app).length !== 0 && (
          <DataSourceList
            actual_appId={props.appId}
            datasources={app.data_sources}
          />
        )}
        <br></br>
        <br></br>
        <br></br>
        {Object.keys(app).length !== 0 && (
          <ViewsList
            views = {app.views}
          />
        )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default EditApp
