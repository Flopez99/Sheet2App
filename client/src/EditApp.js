import React from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';
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


const theme = createTheme();


function EditApp(props) {//props.datasource contains datasource id needed to fill in page
 const [datasource, setDatasource] = useState({})
 console.log(props.datasource)
 useEffect(async () => {
    await axios.get("http://localhost:8080/app", { params: {
        id: props.datasource
    }})
    .then((res) =>{
        console.log("Got Datasource")
        console.log(res.data)
        setDatasource(res.data)
    })
  }, []);
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
          <Box component="form" noValidate  sx={{ mt: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <TextField
                  name="App Name"
                  value = {datasource.app_name || ""}
                  required
                  fullWidth
                  id="appName"
                  label="App Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value = {datasource.role_membership_url || ""}
                  fullWidth
                  id="rolemembershipsheet"
                  label="Role Membership Sheet URL"
                  name="rolemembershipsheet"
                />
              </Grid>
            </Grid>
              <Grid container spacing = {2}>
              <Grid item xs={12} sm = {6}>
                    <Button
                        component={Link} to="/createdatasource"
                        type="AddDataSource"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        >
                        Add Data
                    </Button>
                </Grid>
                <Grid item xs={12} sm = {6}>
                        <Button
                            component={Link} to="/view"
                            type="AddView"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            >
                            Add View
                        </Button>
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
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  
  )
}

export default EditApp
