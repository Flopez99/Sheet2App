import React from 'react';
import {Stack, Button, Link, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps';
import Navbar from './Navbar';
import CreateApp from './CreateApp';
import DeveloperApps from './DeveloperApps';
import EndUserApps from './EndUserApps';
import ViewScreen from './ViewScreen';
import { Route, Routes } from 'react-router-dom';

function App() {
    return (
    <>
        <CssBaseline />
        <Navbar />
        <Routes>
            <Route path="/" element= {<DeveloperApps/>}/>
            <Route path="/enduser" element={<EndUserApps/>}/>
            <Route path="/createapp" element={<CreateApp/>}/>
            <Route path="/view" element={<ViewScreen />} />
        </Routes>
    </>

    )
}

export default App;