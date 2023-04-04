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
import CreateView from './CreateView';
import EditDataSource from './EditDataSource';
import EndUserApp from './EndUserApp';
import DisplayApp from './DisplayApp';

function App() {
    const [user, setUser] = useState({})
    const [datasource, setDatasource] = useState({})
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [appId, setAppId] = useState({})
    const [datasourceId, setDatasourceId] = useState({})
    const [view, setView] = useState({})


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
            var appId = location.state //not really datasource, its more appid
            console.log("id " + appId)
            setAppId(appId)//passes as a datasource id
        }
      }
      if(location.pathname === "/end_user_app"){
        if(location.state != null){
            var appId = location.state //not really datasource, its more appid
            console.log("id " + appId)
            setAppId(appId)//passes as a datasource id
        }
      }

      if(location.pathname === "/view"){
        if(location.state != null){
            var appId = location.state //not really datasource, its more appid
            setAppId(appId)//passes as a datasource id
        }
      }

      if(location.pathname === "/createdatasource"){
        if(location.state != null){
            var appid = location.state //not really datasource, its more appid
            console.log("id " + appid)
            setAppId(appid)//passes as a datasource id
        }
      }
      if(location.pathname === "/editdatasource"){
        if(location.state != null){
            console.log(location.state)
            var datasourceId = location.state.datasourceId //not really datasource, its more appid
            var appId = location.state.appId
            console.log("id " + datasourceId)
            setDatasourceId(datasourceId)//passes as a datasource id
            setAppId(appId)
        }
      }
      if(location.pathname === "/editview"){
        console.log('in view 1')
        if(location.state != null){
            const view = location.state.view //not really datasource, its more appid
            console.log('in view')
            console.log(location.state)
            setView(view)//passes as a datasource id
        }
      }
    }, [location, user, datasource, appId, datasourceId, view]);

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
            <Route path="/createdatasource" element={<CreateDataSource appId = {appId}/>}/>
            <Route path="/editapp" element={<EditApp appId = {appId}/>}/>
            <Route path="/view" element={<CreateView appId = {appId}/>} />
            <Route path ="/editview" element={<CreateView appId = {appId} view= {view}/>}/>
            <Route path="/editdatasource" element = {<EditDataSource datasource_id={datasourceId} appId = {appId} />} />
            <Route path="/end_user_app" element = {<DisplayApp appId = {appId} userEmail = {user.email}/>}/>
        </Routes>
    </>

    )
}

export default App;