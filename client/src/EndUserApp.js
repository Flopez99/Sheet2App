
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route, Routes, useLocation } from 'react-router-dom';
import {Stack, Button, Link, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material'
import TableView from './TableView';
import EndUserNavBar from './EndUserNavBar';


function EndUserApp(props) {
  console.log('appid')
  console.log(props.appId)
  const [app, setApp] = useState({})
  console.log("In enduserapp")
  //Used on Initialize
  useEffect(() => {
    const getApp = async () => {
      try {
        const res = await axios.get("http://localhost:8080/app", { params: { id: props.appId } });
        console.log("Got App");
        console.log(res.data);
        setApp(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getApp();
  }, [props.appId]);
  
  // useEffect(() => {

  // }, [app])
  
  const datasource1 = []//info taken from table, and filled in with initial value info of column if needed
  const datasource2 = []
  const all_views = [] //list of accessible views of the user based on roles.
  return (
    <> 
    <CssBaseline />
    <Routes>
      {Object.keys(app).length !== 0 && (
        <Route path='/end_user_view/:id' element={<TableView views = {app.views}/>}/>
      )}
      {/* {Object.keys(app).length !== 0 && app.views.length !== 0 && (
        (app.views)
        .filter(view => view.view_type === "TableView")
        .map(view => (
          <Route path={`/end_user_view/view_${view._id}`} element={<TableView view = {view}/>}/>
        ))
      )} */}
    </Routes>
    {Object.keys(app).length !== 0 && app.views.length !== 0 && (<EndUserNavBar tableViews ={app.views.filter(view => view.view_type === "TableView")} />)}
</>
  )
}

export default EndUserApp
