
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route, Routes, useLocation } from 'react-router-dom';
import {CssBaseline} from '@mui/material'
import TableView from './TableView';
import EndUserNavBar from './EndUserNavBar';

const siteURL = process.env.SITE_URL || 'http://localhost:8080';

function EndUserApp(props) {
  const [app, setApp] = useState({})
  //Used on Initialize
  useEffect(() => {
    const getApp = async () => {
      try {
        const res = await axios.get(`${siteURL}/app`, { params: { id: props.appId } });
        console.log("Got App");
        console.log(res.data);
        setApp(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getApp();
  }, [props.appId]);
  
  
  
  return (
    <> 
    <CssBaseline />
    <Routes>
      {Object.keys(app).length !== 0 && (
        <Route path='/end_user_view/:id' element={<TableView views = {app.views}/>}/>
      )}
    </Routes>
    {Object.keys(app).length !== 0 && app.views.length !== 0 && (<EndUserNavBar tableViews ={app.views.filter(view => view.view_type === "TableView")} />)}
</>
  )
}

export default EndUserApp
