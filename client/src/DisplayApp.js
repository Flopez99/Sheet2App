import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import TableView from './TableView';

const theme = createTheme(() => ({
    root: {
    flexGrow: 1,
  },
  appBar: {
    marginBottom: 2,
  },
  title: {
    flexGrow: 1,
  },
}));

function DisplayApp(props) {
  console.log(props)
  const [app, setApp] = useState({})
  const [views, setViews] = useState([]);
  const [tableViews, setTableViews] = useState([])
  const [sheetData, setSheetData] = useState([]) 
  const [activeTableViewIndex, setActiveTableViewIndex] = useState(0);
  const [roles, setRoles] = useState([])
  const classes = theme;

  useEffect(() => {
    const getApp = async () => {
      try {
        const res = await axios.get("http://localhost:8080/app", { params: { id: props.appId } });
        console.log("Got App");
        console.log(res.data);
        setApp(res.data);
        const app = res.data

      } catch (error) {
        console.error(error);
      }
    };
    getApp();
  }, [props.appId]);

  useEffect(() => {
    const getViews = async () => {
      try{
        //set views specific to roles
        const res1 = await axios.get("http://localhost:8080/roles_user", { params: { appId: props.appId, userEmail: props.userEmail} });
        const roles = res1.data.roles
        setRoles(roles);
        console.log(roles)
        const views = []
        for (const role of roles){
          const tempArr = (app.views).filter(view => view.roles.includes(role))
          console.log(role)
          console.log(tempArr)
          views.push.apply(views, tempArr)
        }
        console.log(views)
        const views_no_dup = [... new Set(views)]
        console.log(views_no_dup)
        setViews(views_no_dup);
        const tableViews1 =  views_no_dup.filter(view => view.view_type === "TableView")
        console.log(tableViews1)
        setTableViews(tableViews1)
        
      } catch (error) {
        console.error(error);
      }
    };
    if(Object.keys(app).length !== 0)
      getViews();
  },[app])

  useEffect(() => {
    console.log("HERE")
    const getSheetData = async () => {
      let sheet_data = []
      for(const view of tableViews){
        if(!(sheet_data.some(sheet => sheet._id = view.table._id))){//checks if is in list alread
          var specific_data;
          try{
            var sheetId = getIdFromUrl(view.table.url);
            var sheetIndex = view.table.sheet_index
            const res = await axios.get("http://localhost:8080/records", 
              { params: {sheetId: sheetId, sheetIndex: sheetIndex} });
            console.log(view.table.url)
            console.log(res.data.values)
            specific_data = res.data.values
          }
          catch{
            console.log("ERROOR IN GETTING SHEET DATA")
          }
          console.log(specific_data)
          sheet_data.push({...view.table, sheet_data: specific_data})
          console.log(sheet_data)
        }
      }
      console.log(sheet_data)
      setSheetData(sheet_data)
    };
    if(Object.keys(tableViews).length !== 0)
      getSheetData();
  },[tableViews])

  if (tableViews.length === 0) {
    return <div>Loading views...</div>;
  }

  const activeTableView = tableViews[activeTableViewIndex];
  const activeDataSource = sheetData.find(e => e._id === activeTableView.table._id)
  const handleChangeView = (index) => {
    console.log(sheetData)
    setActiveTableViewIndex(index);
  };

  return (
    <ThemeProvider theme={theme}>
        <div>
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
            {tableViews.map((view, index) => (
                <Button key={view._id} color="inherit" onClick={() => handleChangeView(index)}>
                {view.name}
                </Button>
            ))}
            </Toolbar>
        </AppBar>
        <div className={classes.root}>
            <Typography variant="h3" className={classes.title}>
            </Typography>
            <TableView view={activeTableView} sheetData = {activeDataSource}/>
        </div>
        </div>
    </ThemeProvider>
  );
  function getIdFromUrl(url) {
    const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

export default DisplayApp;