// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { AppBar, Toolbar, Typography, Button } from '@mui/material';
// import TableView from './TableView';
// import DetailView from './DetailView';
// import { BottomNavigation, BottomNavigationAction } from '@mui/material';


// const theme = createTheme({
//   root: {
//     flexGrow: 1,
//   },
//   appBar: {
//     marginBottom: 2,
//   },
//   title: {
//     flexGrow: 1,
//   },
//   bottomNav: {
//     position: 'fixed',
//     bottom: 0,
//     width: '100%',
//     backgroundColor: '#3f51b5',
//   },
//   bottomNavAction: {
//     color: 'white',
//     '&$selected': {
//       color: '#ff9800',
//     },
//   },
//   selected: {},
// });




// function DisplayApp(props) {
//   console.log(props)
//   const [app, setApp] = useState({})
//   const [views, setViews] = useState([]);
//   const [tableViews, setTableViews] = useState([])
//   const [detailViews, setDetailViews] = useState([])
//   const [currDetailView, setcurrDetailView] = useState([])

//   const [sheetData, setSheetData] = useState([]) 
//   const [activeTableViewIndex, setActiveTableViewIndex] = useState(0);

//   const [roles, setRoles] = useState([])
//   const classes = theme;
//   const [selectedRecord, setSelectedRecord] = useState(null) 

//   const [schemaFlag, setSchemaFlag] = useState(true)

//   useEffect(() => {
//     const getApp = async () => {
//       try {
//         const res = await axios.get("http://localhost:8080/app", { params: { id: props.appId } });
//         console.log("Got App");
//         console.log(res.data);
//         setApp(res.data);
//         const app = res.data

//       } catch (error) {
//         console.error(error);
//       }
//     };
//     getApp();
//   }, [props.appId]);

//   useEffect(() => {
//     const getViews = async () => {
//       try{
//         //set views specific to roles
//         const res1 = await axios.get("http://localhost:8080/roles_user", { params: { appId: props.appId, userEmail: props.userEmail} });
//         const roles = res1.data.roles
//         setRoles(roles);
//         console.log(roles)
//         const views = []
//         for (const role of roles){
//           const tempArr = (app.views).filter(view => view.roles.includes(role))
//           console.log(role)
//           console.log(tempArr)
//           views.push.apply(views, tempArr)
//         }
//         console.log(views)
//         const views_no_dup = [...new Set(views)]
//         console.log(views_no_dup)
//         setViews(views_no_dup);
//         const tableViews1 =  views_no_dup.filter(view => view.view_type === "TableView")
//         const detailViews1 =  views_no_dup.filter(view => view.view_type === "DetailView")

//         console.log(tableViews1)
//         setTableViews(tableViews1)
//         setDetailViews(detailViews1)

//       } catch (error) {
//         console.error(error);
//       }
//     };
//     if(Object.keys(app).length !== 0)
//       getViews();
//   },[app])

//   useEffect(() => {
//     console.log("HERE")
//     const getSheetData = async () => {
//       let sheet_data = []
//       for(const view of tableViews){
//         if(!(sheet_data.some(sheet => sheet._id = view.table._id))){//checks if is in list alread
//           var specific_data;
//           try{
//             var sheetId = getIdFromUrl(view.table.url);
//             var sheetIndex = view.table.sheet_index
//             const res = await axios.get("http://localhost:8080/records", 
//               { params: {sheetId: sheetId, sheetIndex: sheetIndex} });
//             console.log(view.table.url)
//             console.log(res.data.values)
//             specific_data = res.data.values
//           }
//           catch{
//             console.log("ERROOR IN GETTING SHEET DATA")
//           }
//           console.log(specific_data)
//           sheet_data.push({...view.table, sheet_data: specific_data})
//           console.log(sheet_data)
//         }
//       }
//       console.log(sheet_data)
//       setSheetData(sheet_data)
//     };
//     if(Object.keys(tableViews).length !== 0)
//       getSheetData();
//   },[tableViews])
//   useEffect(() => {
//     const checkSchema = async () => {
//       console.log("IN CHECK SCHEMA")
//       for(const datasource of sheetData){
//         const all_columns = datasource.columns
//         const column_headers = datasource.sheet_data[0] //column headers
//         for(const column_name of column_headers){
//           if((all_columns.findIndex(col => col.name === column_name)) === -1){
//             setSchemaFlag(false)
//             console.log(column_name)
//             console.log("SCHEMA BAD")
//             return
//           }
//         }
//       }
//       setSchemaFlag(true)
//       console.log("SCHEMA GOOD")
//     }
//     if(Object.keys(sheetData).length !== 0)
//       checkSchema();
//   }, [sheetData])
//   if (tableViews.length === 0) {
//     return <div>Loading views...</div>;
//   }
//   if(!schemaFlag){
//     return <div>Schema Inconsistent, Developer Must Update Datasources</div>;
//   }

//   const activeTableView = tableViews[activeTableViewIndex];
//   const activeDataSource = sheetData.find(e => e._id === activeTableView.table._id)
  
//   const handleChangeView = (index) => {
//     console.log(sheetData)
//     const newTableView = tableViews[index];
//     setActiveTableViewIndex(index);

//     const newDataSource = sheetData.find(e => e._id === newTableView.table._id);

//     console.log(newTableView)
//     console.log(detailViews)
//     const newDetailViews = detailViews.filter(view => view.table.name === newTableView.table.name);

//     console.log("yo")
//     console.log(newDetailViews)
//     setcurrDetailView(newDetailViews.length > 0 ? newDetailViews[0] : null);
//   };

//   const handleClickRecord = (record, other) => {
//     if(currDetailView){
//       console.log("This is curr detail")
//       console.log(currDetailView)
//       setSelectedRecord(record)
//     }else{
//       console.log("Uhh there's no detailview")
//     }
//   }

//   const handleBackToTableView = () => {
//     setSelectedRecord(null) // clear selected record when going back to table view
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <div>
//         <div className={classes.root}>
//           <Typography variant="h3" className={classes.title}></Typography>
//           {selectedRecord ? (
//             <div>
//               <Button onClick={handleBackToTableView}>Back to Table View</Button>
//               <DetailView record={selectedRecord} detailView={currDetailView} />
//             </div>
//           ) : (
//             <TableView
//               onClickRecord={handleClickRecord}
//               view={activeTableView}
//               sheetData={activeDataSource}
//               userEmail={props.userEmail}
//             />
//           )}
//         </div>
//         <BottomNavigation
//           value={activeTableViewIndex}
//           onChange={(event, newValue) => handleChangeView(newValue)}
//           showLabels
//           className={classes.bottomNav}
//         >
//           {tableViews.map((view, index) => (
//             <BottomNavigationAction
//               key={view._id}
//               label={view.name}
//               className={classes.bottomNavAction}
//               classes={{ selected: classes.selected }}
//             />
//           ))}
//         </BottomNavigation>
//       </div>
//     </ThemeProvider>
//   );
  
  
  

//   function getIdFromUrl(url) {
//     const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
//     const match = url.match(regex);
//     return match ? match[1] : null;
//   }
// }

// export default DisplayApp;

// THE TOP PART PUTS IT AT THE BOTTOM OF THE TABLE
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, BottomNavigation, BottomNavigationAction, Tabs, Tab } from '@mui/material';
import TableView from './TableView';
import DetailView from './DetailView';



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
  console.log(props)
  const [app, setApp] = useState({})
  const [views, setViews] = useState([]);
  const [tableViews, setTableViews] = useState([])
  const [detailViews, setDetailViews] = useState([])
  const [currDetailView, setcurrDetailView] = useState([])

  const [sheetData, setSheetData] = useState([]) 
  const [activeTableViewIndex, setActiveTableViewIndex] = useState(0);

  const [roles, setRoles] = useState([])
  const classes = theme;
  const [selectedRecord, setSelectedRecord] = useState(null) 

  const [schemaFlag, setSchemaFlag] = useState(true)

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
        const views_no_dup = [...new Set(views)]
        console.log(views_no_dup)
        setViews(views_no_dup);
        const tableViews1 =  views_no_dup.filter(view => view.view_type === "TableView")
        const detailViews1 =  views_no_dup.filter(view => view.view_type === "DetailView")

        console.log(tableViews1)
        setTableViews(tableViews1)
        setDetailViews(detailViews1)

        const startTableView = tableViews1[0];
        const startDetailViews = detailViews.filter(view => view.table.name === startTableView.table.name);

        setcurrDetailView(startDetailViews.length > 0 ? startDetailViews[0] : null);
        

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

  useEffect(() => {
    const checkSchema = async () => {
      console.log("IN CHECK SCHEMA")
      for(const datasource of sheetData){
        const all_columns = datasource.columns
        const column_headers = datasource.sheet_data[0] //column headers
        for(const column_name of column_headers){
          if((all_columns.findIndex(col => col.name === column_name)) === -1){
            setSchemaFlag(false)
            console.log(column_name)
            console.log("SCHEMA BAD")
            return
          }
        }
      }
      setSchemaFlag(true)
      console.log("SCHEMA GOOD")
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
  
  const handleChangeView = (index) => {
    console.log(sheetData)
    const newTableView = tableViews[index];
    setActiveTableViewIndex(index);

    const newDataSource = sheetData.find(e => e._id === newTableView.table._id);

    const newDetailViews = detailViews.filter(view => view.table.name === newTableView.table.name);

    console.log("yo")
    console.log(newDetailViews)
    setcurrDetailView(newDetailViews.length > 0 ? newDetailViews[0] : null);
  };

  const handleClickRecord = (record, other) => {
    if(currDetailView){
      console.log("This is curr detail")
      console.log(currDetailView)
      setSelectedRecord(record)
    }else{
      console.log("Uhh there's no detailview")
    }
  }

  const handleBackToTableView = () => {
    setSelectedRecord(null) // clear selected record when going back to table view
  }

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Tabs
          value={activeTableViewIndex}
          onChange={(event, newValue) => handleChangeView(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          className={classes.topNav}
          classes={{ indicator: classes.indicator }}
        >
          {tableViews.map((view, index) => (
            <Tab
              key={view._id}
              label={view.name}
              className={classes.tab}
            />
          ))}
        </Tabs>
        <div className={classes.root}>
          <Typography variant="h3" className={classes.title}></Typography>
          {selectedRecord ? (
            <div>
              <Button onClick={handleBackToTableView} className={classes.backButton}>
                Back to Table View
              </Button>
              <DetailView record={selectedRecord} detailView={currDetailView} view = {activeTableView} />
            </div>
          ) : (
            <TableView
              onClickRecord={handleClickRecord}
              view={activeTableView}
              sheetData={activeDataSource}
              userEmail={props.userEmail}
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