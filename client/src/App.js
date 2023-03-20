import React from 'react';
import {Stack, Button, Link, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps';
import Navbar from './Navbar';
import CreateApp from './CreateApp';
import DeveloperApps from './DeveloperApps';
import MyApps from './MyApps';
import EndUserApps from './EndUserApps';
import DataSource from './DataSource';
import CreateDataSource from './CreateDataSource';
import { Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import {useEffect, useState, useMemo} from 'react'
import EditApp from './EditApp';
import ViewScreen from './ViewScreen';


function App() {
    const [user, setUser] = useState({})
    const [datasource, setDatasource] = useState({})
    const [isDeveloper, setIsDeveloper] = useState(false);


    let location = useLocation();

    useMemo(() => { //runs this code and before rendering
      if(location.pathname === "/developer" || location.pathname === "/enduser"){
        if(location.pathname === "/developer"){
          console.log("in developer")
          setIsDeveloper(true);
        }

        if(location.state != null){
            console.log("LOGGED IN")
            var userObject = location.state
            console.log(userObject)
            setUser(userObject)

        }
      }
      
      if(location.pathname === "/"){
        if(location.state === "Logged Out"){
            if(Object.keys(user).length !== 0)
            {
                console.log("Logged Out")
                setIsDeveloper(false);
                setUser({});
            }
        }
      }
      if(location.pathname === "/editapp"){
        if(location.state != null){
            var datasource = location.state
            console.log("id " + datasource)
            setDatasource(datasource)//passes as a datasource id
        }
      }
    }, [location, user, datasource]);

    return (
    <>
        <CssBaseline />
        <Navbar user = {user} />
        <Routes>
            <Route path="/" element= {<LandingPage/>}/>
            <Route path= "/developer" element = {<DeveloperApps userEmail = {user.email}/>}/>
            <Route path="/myapps" element={<MyApps userEmail={user.email} />} />
            <Route path="/enduser" element={<EndUserApps userEmail={user.email} isDeveloper={isDeveloper}/>}/>
            <Route path="/createapp" element={<CreateApp user = {user}/>}/>
            <Route path="/datasource" element={<DataSource/>}/>
            <Route path="/createdatasource" element={<CreateDataSource/>}/>
            <Route path="/editapp" element={<EditApp datasource = {datasource}/>}/>
            <Route path="/view" element={<ViewScreen />} />

        </Routes>
    </>

    )
}

export default App;