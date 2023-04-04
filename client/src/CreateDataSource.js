import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { DataGrid, GridRowsProp, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios'
import { updateCacheWithNewRows } from '@mui/x-data-grid/hooks/features/rows/gridRowsUtils';
import { useMemo, useRef } from "react";
import Alert from '@mui/material/Alert';
import { flattenOptionGroups } from '@mui/base';
import { useNavigate } from 'react-router-dom'




const columns  = [
  {
    field: 'column_name',
    headerName: 'Column  name',
    width: 150,
    flex: 1,

  },
  {
    field: 'key',
    headerName: 'Key',
    width: 110,
    editable: true,
    type: 'boolean',
    flex: 1,
  },
  {
    field: 'initial_value',
    headerName: 'Initial Value',
    width: 150,
    editable: true,
    type: 'string',
    flex: 1,
  },
  {
    field: 'label',
    headerName: 'label',
    type: 'boolean',
    width: 80,
    editable: true,
    flex: 1
  },
  {
    field: 'reference',
    headerName: 'reference',
    type: 'string',
    width: 110,
    editable: true,
    flex: 1
  },
  {
    field: 'type',
    headerName: 'type',
    type: 'string',
    width: 110,
    editable: true,
    flex: 1
  },
];
//Taken from stack overflow used to read data from datagrid
function useApiRef() {
  const apiRef = useRef(null);
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "__HIDDEN__",
        width: 0,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        }
      }),
    [columns]
  );

  return { apiRef, columns: _columns };
}


function CreateDataSource(props) {
  const navigate = useNavigate();
  console.log(props)
  const { apiRef, columns } = useApiRef();
  const theme = createTheme();
  const [rows, setRows] = useState([]);
  const [labelError, setLabelError] = useState(false)
  const [typeError, setTypeError] = useState(false)
  const [datasource_name, setDatasource_name] = useState("")
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("")
  const [sheetIndex, setSheetIndex] = useState(0)
  const [referenceError, setReferenceError] = useState(false)
  const [keyError, setKeyError] = useState(false)


  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // datasource_name = data.get('datasourcename')
    // spreadsheetUrl = data.get('spreadsheeturl');
    // sheetIndex = data.get('sheetindex');
    setDatasource_name(data.get('datasourcename'))
    setSpreadsheetUrl(data.get('spreadsheeturl'))
    setSheetIndex(data.get('sheetindex'))

    const sheetId = getIdFromUrl(spreadsheetUrl);

    if (sheetId) {
      console.log(sheetId);
      console.log(sheetIndex);
      await fetchSheetData(sheetId, sheetIndex);
      
    } else {
      console.log('Invalid URL');
    }
  };
function checkKey(array){
  var key_row;
    var count = 0;
    array.forEach((row) => {
      if(row.value.label === true){
        key_row = row.value;
        count++;
      }
    })
    console.log(count)
    if(count != 1){
      setKeyError(true)
      return null
    }
    else{
      setKeyError(false)
      return key_row
    }
}
function checkLabel(array){
  var label_row;
    var count = 0;
    array.forEach((row) => {
      if(row.value.label === true){
        label_row = row.value;
        count++;
      }
    })
    console.log(count)
    if(count != 1){
      setLabelError(true)
      return null
    }
    else{
      setLabelError(false)
      return label_row
    }
}
async function checkReference(array){
  let flag = true;
  console.log('in reference')
  console.log(array)
  // array.forEach((column) => {
  //   if(column.value.reference !== undefined){
  //     console.log("good")
  //     console.log(column.value.reference)
  //   }
  // })
  for(let column of array){
    if(column.value.reference !== ""){
      console.log(column.value)
      const stringArr = column.value.reference.split(" ")

      let url = stringArr[0]
      let sheetIndex = stringArr[1]
      console.log(url)
      console.log(sheetIndex)
      if(url === null)
        console.log('error') // should change this to displaying alert
      await axios.get('http://localhost:8080/datasource_url' , {params : {
        url: url,
        sheetIndex: sheetIndex
      }})
      .then((res) => {
        console.log(res)
        if(res.data === ''){
          console.log('not good')
          setReferenceError(true)
          flag = false;
        }
        else{
          column.value.reference = res.data._id
        }
      })

    }
    // if(column.value.reference){
    //   console.log('true')
    //   console.log(column)
    // }
  }
  return flag;

}
function checkType(array){
  let flag = true;
  array.forEach((row) =>{
    if(row.value.type === "Boolean")
      return;
    if(row.value.type === "Number")
      return;
    if(row.value.type === "Text")
      return;
    if(row.value.type === "URL")
      return;
    flag = false;
  })
  setTypeError(!flag) 
  return flag
}

  const handleCreate = async () => {
    console.log(apiRef.current.getRowModels());
    var rowModel = await apiRef.current.getRowModels()
    var array =  Array.from(rowModel, ([key, value]) =>({value}));
    //check if multiple Label
    var boolFlag = true
    boolFlag = boolFlag && checkType(array);
    var label_row
    var key_row = checkKey(array)
    if(label_row= checkLabel(array) === null)
      boolFlag = false;
    if(key_row === null)
      boolFlag = false;
    boolFlag = boolFlag && (await checkReference(array));
    if(boolFlag){
      console.log("Here")
      //creates columns
      var key_column;
      var column_list = []
      // array.forEach( (column) => {
      for(const column of array){
        console.log(column)
        await axios.post("http://localhost:8080/column", {
          name: column.value.column_name,
          initial_value: column.value.initial_value,
          label: column.value.label,
          references:  column.value.reference,
          type: column.value.type
        })
        .then((res) => {
          column_list.push(res.data._id)
        })
      }
      //creates datasource
      console.log(" name: " + datasource_name)
      var datasourceId;
      await axios.post("http://localhost:8080/datasource", {
        name: datasource_name,
        url: spreadsheetUrl,
        sheet_index: sheetIndex,
        key: key_row,
        columns: column_list,
        consistent: true
      })
      .then((res) => {
        console.log(res.data._id)
        datasourceId = res.data._id
      })
      await axios.post('http://localhost:8080/app_datasource', {
        appId: props.appId,
        datasourceId: datasourceId 
      })
      .then((res) => {
        navigate("/editapp", {state: props.appId})
      })
    }

  };

  const handleRowUpdate = (newRow, oldRow) => {
    console.log(newRow)
    console.log(oldRow)
    return newRow;
};
  // ... Rest of your component code

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="md">
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
            Create DataSource
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <TextField
                  name="datasourcename"
                  required
                  fullWidth
                  id="dataSourceName"
                  label="Data Source Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="spreadsheeturl"
                  label="Spread Sheet Url"
                  name="spreadsheeturl"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="sheetindex"
                  label="Sheet Index"
                  name="sheetindex"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Generate Columns
            </Button>
          </Box>
          {labelError && (<Alert severity="error">Label only allowed for 1 Column!</Alert>)}
          {typeError && (<Alert severity="error">All Columns Should habve A Type. Ex. Text, Boolean, URL, Number!</Alert>)}
          {referenceError && (<Alert severity="error">To use reference must place Google Sheet URL + whitespace + sheetIndex. Reference may not be valid</Alert>)}
          {keyError && (<Alert severity="error">Must Have a Key!</Alert>)}
          <Box sx={{ height: 400, width: '100%'}}>
            {Object.keys(rows).length !== 0 && (
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkbox
                processRowUpdate={handleRowUpdate}
              />)}
            </Box>
          {Object.keys(rows).length !== 0 && (
            <Button
              type="createDataSource"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick = {handleCreate}
            >
              Create Datasource
            </Button>)}
        </Box>
      </Container>
    </ThemeProvider>
  );
  function generateColumns(headerRow) {
    return headerRow.map((columnName, index) => ({
      field: `col${index}`,
      headerName: columnName,
      width: 150,
      editable: true,
    }));
  }
  
  // Function to generate row data for DataGrid from the remaining rows
  async function  generateRows(dataRows) {
    console.log("In generation")
    console.log(dataRows)
    const rowData = [];
    dataRows.forEach((element, index) =>{
      rowData.push({id: index, column_name: element, 
        initial_value: "", label: false, reference: "", type: "", key: false });
    })
    console.log(rowData);
    return rowData
  
  }
  
  // Function to fetch the sheet data from your server
  async function fetchSheetData(sheetId, sheetIndex) {
      const response = axios.get("http://localhost:8080/api/fetchSheetData" , {params : {
        sheetId: sheetId,
        sheetIndex: sheetIndex
      }})
      .then(async (response) => {
        console.log(response)
        if (response.status == 200) {
          const data =  await response.data.values[0];
          console.log(response.data.values);
          // const columns = generateColumns(data.values[0]);
          var rows;
          generateRows(data)
          .then((res) => {
            rows = res;
            setRows(res);
          })
        } 
        else {
        console.error('Error fetching sheet data:', response.statusText);
        return null;
        }
      })
      .catch((err) => {
        console.log("Err With Sheet")
        return null
      })
  }
  
  function getIdFromUrl(url) {
    const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}



export default CreateDataSource;

