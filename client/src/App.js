import React from 'react';
import {Stack, Button, Link, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps';
import Navbar from './Navbar';
import CreateApp from './CreateApp';
import DeveloperApps from './DeveloperApps';
import EndUserApps from './EndUserApps';
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
        </Routes>
    </>

    )
}

export default App;