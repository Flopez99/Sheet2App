import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {Typography, Button, Tabs, Tab } from '@mui/material';
import TableView from './TableView';
import DetailView from './DetailView';

const siteURL = process.env.SITE_URL || 'http://localhost:8080';

const theme = createTheme({
  root: {
    flexGrow: 1,
  },
  appBar: {
    marginBottom: 2,
  },
  title: {
    flexGrow: 1,
  },
  topNav: {
    width: '100%',
    backgroundColor: '#3f51b5',
  },
  tab: {
    minWidth: 'auto',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'none',
  },
  backButton: {
    backgroundColor: '#3f51b5',
    color: 'white',
    borderRadius: '5px',
    padding: '6px 16px',
    fontSize: '35px',
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#283593',
    },
  },
  indicator: {
    backgroundColor: '#ff9800',
  },
});



function DisplayApp(props) {
  const [app, setApp] = useState({})
  const [setViews] = useState([]);
  const [tableViews, setTableViews] = useState([])
  const [detailViews, setDetailViews] = useState([])
  const [currDetailView, setcurrDetailView] = useState([])
  const [sheetData, setSheetData] = useState([]) 
  const [activeTableViewIndex, setActiveTableViewIndex] = useState(0);
  const [setRoles] = useState([])
  const classes = theme;
  const [selectedRecord, setSelectedRecord] = useState(null) 
  const [selectedTableHeader, setSelectedTableHeader] = useState(null) 
  const [currentKeyIndex, setCurrentKeyIndex] = useState(-1)
  const [schemaFlag, setSchemaFlag] = useState(true)
  const [allColumnsTypes, setAllColumnTypes] = useState([])

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

  useEffect(() => {
    const getViews = async () => {
      try{
        //set views specific to roles
        const res1 = await axios.get(`${siteURL}/roles_user`, { params: { appId: props.appId, userEmail: props.userEmail} });
        const roles = res1.data.roles
        setRoles(roles);
        console.log("Users Roles")
        console.log(roles)
        const views = []
        for (const role of roles){
          const tempArr = (app.views).filter(view => view.roles.includes(role))
          views.push.apply(views, tempArr)
        }
        const views_no_dup = [...new Set(views)]
        setViews(views_no_dup);
        const tableViews1 =  views_no_dup.filter(view => view.view_type === "TableView")
        const detailViews1 =  views_no_dup.filter(view => view.view_type === "DetailView")

        setTableViews(tableViews1)
        setDetailViews(detailViews1)
        
        // Set the initial detail view
        const newDetailView = detailViews1.find(view => view.table.name === tableViews1[0].table.name);
        setcurrDetailView(newDetailView);

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
        if(!(sheet_data.some(sheet => sheet._id === view.table._id))){//checks if is in list alread
          console.log(view.table.name)
          var specific_data;
          try{
            const res = await axios.get(`${siteURL}/records`, 
              { params: {sheet_url: view.table.url } });
            specific_data = res.data.values
            sheet_data.push({...view.table, sheet_data: specific_data})
          }
          catch{
            console.log("ERROOR IN GETTING SHEET DATA")
          }
        } 
      }

      var app_datasource = app.data_sources
      //gets the rest of the datasources from app
      for(const datasource of app_datasource){
        if(!(sheet_data.some(sheet => sheet._id === datasource._id))){//checks if is in list alread
          try{
            const res = await axios.get(`${siteURL}/records`, 
              { params: {sheet_url: datasource.url} });
            specific_data = res.data.values
            sheet_data.push({...datasource,sheet_data: specific_data})
          }
          catch{
            console.log("ERROOR IN GETTING SHEET DATA")
          }
        }

      }
  
      setSheetData(sheet_data)
    };

    
    if(Object.keys(tableViews).length !== 0)
      getSheetData();
  },[tableViews])

  useEffect(() => {
    const checkSchema = async () => {
      for(const datasource of sheetData){
        const all_columns = datasource.columns
        const column_headers = datasource.sheet_data[0] //column headers
        for(const column_name of column_headers){ //checks if all columns in sheet is included in db
          if((all_columns.findIndex(col => col.name === column_name)) === -1){
            setSchemaFlag(false)
            return
          }
        }
        for(const column of all_columns){ //checks if all columns in db is included in sheet
          if((column_headers.findIndex(col => col === column.name)) === -1){
            setSchemaFlag(false)
            return
          }
        }
      }
      setSchemaFlag(true)
    }
    if(Object.keys(sheetData).length !== 0)
      checkSchema();
  }, [sheetData])
  
  if (tableViews.length === 0) {
    return <div>Loading views...</div>;
  }
  if(!schemaFlag){
    return <div>Schema Inconsistent, Developer Must Update Datasources</div>;
  }

  const activeTableView = tableViews[activeTableViewIndex];
  const activeDataSource = sheetData.find(e => e._id === activeTableView.table._id)
  console.log(activeTableView)
  console.log(sheetData)
  
  const handleChangeView = (index) => {
    console.log(sheetData)
    const newTableView = tableViews[index];
    setActiveTableViewIndex(index);

    const newDetailViews = detailViews.filter(view => view.table.name === newTableView.table.name);
    setcurrDetailView(newDetailViews.length > 0 ? newDetailViews[0] : null);
  };

  const handleClickRecord = (record, other, tableHeader, key_index, all_types) => {
    if(currDetailView){
      setSelectedRecord(record)
      setSelectedTableHeader(tableHeader)
      setCurrentKeyIndex(key_index)
      setAllColumnTypes(all_types)
    }else{
      console.log("Uhh there's no detailview")
    }
  }

  const handleClickRefRecord = (record, other, tableHeader, key_index, all_types, refDetailView) => {
      setcurrDetailView(refDetailView)
      setSelectedRecord(record)
      setSelectedTableHeader(tableHeader)
      setCurrentKeyIndex(key_index)
      setAllColumnTypes(all_types)
  }

  const handleBackToTableView = () => {
    setSelectedRecord(null) // clear selected record when going back to table view
  }

  //Refresh info after update has been made
  const refreshSheetData = async (changedTable) => {
    try {
      const changedTableSpreadsheetId = getIdFromUrl(changedTable.url);
  
      const newSheetData = await Promise.all(
        sheetData.map(async table => {
          if(table.url){
            const tableSpreadsheetId = getIdFromUrl(table.url);
  
            if (tableSpreadsheetId === changedTableSpreadsheetId) {
              const sheet_url = table.url;

              const newData = await axios.get(`${siteURL}/records`, {
                params: { sheet_url } 
              });

    
              return {
                ...table,
                sheet_data: newData.data.values // replace the entire sheet_data array with the updated data
              };
            } else {
              return table;
            }
          }else{
            return table
          }
          
        })
      );
  
      // Update the sheetData state with the updated data
      setSheetData(newSheetData);
    } catch (error) {
      console.error('Error sending data to the server:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        {!selectedRecord && (
          <Tabs
            value={activeTableViewIndex}
            onChange={(event, newValue) => handleChangeView(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.topNav}
            classes={{ indicator: classes.indicator }}
          >
            {tableViews.map((view, index) => (
              <Tab key={view._id} label={view.name} className={classes.tab} />
            ))}
          </Tabs>
        )}
        <div className={classes.root}>
          <Typography variant="h3" className={classes.title}></Typography>
          {selectedRecord ? (
            <div>
              <Button onClick={handleBackToTableView} className={classes.backButton} >
                Back to Table View
              </Button>
              <DetailView 
                record={selectedRecord} 
                detailView={currDetailView} 
                view = {activeTableView} 
                tableHeader={selectedTableHeader}
                keyIndex = {currentKeyIndex}
                refreshSheetData={refreshSheetData}
                handleBackToTableView = {handleBackToTableView}
                allColumnsTypes = {allColumnsTypes}
              />
            </div>
          ) : (
            <TableView
              onClickRecord={handleClickRecord}
              view={activeTableView}
              tableHeader={selectedTableHeader}
              sheetData={activeDataSource}
              userEmail={props.userEmail}
              detailView = {currDetailView}
              keyIndex = {currentKeyIndex}
              refreshSheetData={refreshSheetData}
              all_sheets = {sheetData}
              all_detail_views = {detailViews}
              onClickRefRecord = {handleClickRefRecord}
            />
          )}
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