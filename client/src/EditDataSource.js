// Have to show refernces. currently sets it up in the db but does not show it,
//as it is objectid type not string/
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
      field: 'name',
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
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => 
      (params.row.references?.url || '') + ' ' + (params.row.references?.sheet_index || '')
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



function EditDataSource({datasource_id, appId}) {
const navigate = useNavigate();
  console.log("Hi")
  console.log(datasource_id)
  const { apiRef, columns } = useApiRef();
  const [datasource, setDatasource] = useState({})
  const [datasource_name, setDatasource_name] = useState("")
  const [labelError, setLabelError] = useState(false)
  const [typeError, setTypeError] = useState(false)
  const [referenceError, setReferenceError] = useState(false)
  const [rows1, setRows1] = useState({})
  const [keyError, setKeyError] = useState(false)

  const theme = createTheme();
  useEffect(async () => {
    console.log("In Use Effect")
    await axios.get("http://localhost:8080/datasource", { params: {
        id: datasource_id
    }})
    .then(async (res) =>{
        console.log("Got Datasource")
        console.log(res.data)
        setDatasource(res.data)
        setDatasource_name(res.data.name)
        console.log(res.data.name)
        var sheetId = getIdFromUrl(res.data.url);
        var sheetIndex = res.data.sheet_index
        var rows1 = [];
        var count = 0;
        for(const column of res.data.columns){
            if(res.data.key === column._id)
              rows1.push({id: count, key:true, ...column})
            else
              rows1.push({id: count, key:false, ...column})
            count++;
        }

        await axios.get("http://localhost:8080/api/fetchSheetData" , {params : {
            sheetId: sheetId,
            sheetIndex: sheetIndex
        }})
        .then(async (res) => {
            console.log(res.data.values)
            const headers = res.data.values[0];
            console.log(headers);
            const actual_rows = await generateRows(headers, rows1)
            console.log(actual_rows)
            setRows1(actual_rows);
        })

    })
  }, []);
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
  const handleRowUpdate = (newRow, oldRow) => {
    console.log(newRow)
    console.log(oldRow)
    return newRow;
  };
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
      if(column.value.reference !== undefined &&  column.value.reference !== ""){
        const stringArr = column.value.reference.split(" ")
        console.log(column.value.reference)

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
  const handleUpdate = async() => {
    console.log(apiRef.current.getRowModels());
    var rowModel = await apiRef.current.getRowModels()
    var array =   Array.from(rowModel, ([key, value]) =>({value}));
    //check if multiple Label
    var boolFlag = true
    boolFlag = boolFlag && checkType(array);
    var label_row 
    var key_row = checkKey(array)
    if(checkKey(array) === null)
      boolFlag = false;
    if(label_row= checkLabel(array) === null)
      boolFlag = false;

    boolFlag = boolFlag && (await checkReference(array));
    console.log(boolFlag)
    if(boolFlag){
        console.log("Key ROw:")
        console.log(key_row)
        let new_columns = []
        var key_column;
        console.log(array)
        for await (const column of array){
            if(typeof column.value._id === 'undefined'){
                //new Column
                console.log(column.value)
                //if(column.value.)
                await axios.post("http://localhost:8080/column", {
                    name: column.value.name,
                    initial_value: column.value.initial_value,
                    label: column.value.label,
                    references:  column.value.reference,
                    type: column.value.type
                  })
                  .then((res) => {
                    // if(column.value.label === true)
                    //   key_column = res.data._id
                    new_columns.push(res.data._id)
                  })
            }
            else{
                await axios.post("http://localhost:8080/updateColumn", {
                columnId: column.value._id,
                column_data: {
                    name: column.value.name,
                    initial_value: column.value.initial_value,
                    label: column.value.label,
                    references: column.value.reference,
                    type: column.value.type
                }
                })
                .then((res) => {
                // if(column.value.label === true)
                //     key_column = res.data._id
                })

            }
        }
        
        //creates datasource
        console.log(" name: " + datasource_name)
        console.log(new_columns)
        await axios.post("http://localhost:8080/updateDatasource", {
            datasourceId: datasource_id,
            name: datasource_name,
            key: key_row,
            columns: new_columns,
            consistent: true
        })
        .then((res) => {
            console.log(res.data)
            console.log(res.data._id)
            console.log(appId)
            navigate("/editApp",{state: appId} )
        })

    }
  }

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
          Edit DataSource
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12}>
              <TextField
                name="datasourcename"
                value={datasource_name}
                onChange={(e) => setDatasource_name(e.target.value)}
                required
                fullWidth
                id="dataSourceName"
                label="Data Source Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                value = {datasource.url}
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
                value = {datasource.sheet_index}
                id="sheetindex"
                label="Sheet Index"
                name="sheetindex"
              />
            </Grid>
          </Grid>
        </Box>
        {labelError && (<Alert severity="error">Label only allowed for 1 Column!</Alert>)}
        {typeError && (<Alert severity="error">All Columns Should habve A Type. Ex. Text, Boolean, URL, Number!</Alert>)}
        {referenceError && (<Alert severity="error">To use reference must place Google Sheet URL + whitespace + sheetIndex. Reference may not be valid</Alert>)}
        <Box sx={{ height: 400, width: '100%'}}>
        {Object.keys(rows1).length !== 0 && (
            <DataGrid
              rows={rows1}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              processRowUpdate={handleRowUpdate}
            />)}
          </Box>
          <Button
            type="createDataSource"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick = {handleUpdate}
          >
            Update Datasource
          </Button>
      </Box>
    </Container>
  </ThemeProvider>
  )
  //dataRows = actual headers from google sheet
  //rows = rows from db
  async function generateRows(dataRows, rows){
    let newRows = []
    let count = 0
    let existingColumns = []
    for(const header of dataRows ){
      let current_row = rows.find(row => row.name === header)
      if(current_row){
        current_row.id = count;
        newRows.push(current_row)
        existingColumns.push(current_row._id)
      }
      else{
          newRows.push({id: count, name: header, 
              initial_value: "", label: false, reference: "", type: "" })
      }
      count++;
    }

    //deleting these values from db
    for (const db_column of rows){ //rows that are in the DB
      if(!(existingColumns.includes(db_column._id))){
        console.log(db_column)
        await axios.post("http://localhost:8080/delete_column", {
          columnId: db_column._id
        })
        .then((res) => {
          console.log('GOOOD')
        })
        .catch(()=> {
          console.log('ERROR!!!!!!!!!!!')
        })
      }
    }

    console.log(newRows)
    return newRows;



    // console.log(dataRows)
    // console.log(rows)
    // let size = rows.length
    // let existcolumnindexes = []
    // for(const header of dataRows ){
    //     let doesExistFlag = false;
    //     rows.forEach((column) => {
    //         if(column.name === header){
    //             doesExistFlag = true;
    //             existcolumnindexes.push(column.id)
    //         }
    //     })
    //     if(!doesExistFlag){
    //         console.log("Im here")
    //         rows.push({id: size, name: header, 
    //             initial_value: "", label: false, reference: "", type: "" })
    //         existcolumnindexes.push(size)
    //         size++;
    //     }
    // }
    // console.log(rows)
    // console.log(existcolumnindexes)
    // console.log(size)
    // for(let i = 0; i < size; i++){
    //   if(!(existcolumnindexes.includes(i))){
    //     console.log(i)
    //     rows.splice(i, 1)
    //   }
    // }
    // console.log(rows)
    // return rows;
  }

function getIdFromUrl(url) {
  const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
//used chat gpt for this lol, asked it to use regex to get sheet index
function getSheetIdFromString(str) {
  const pattern = /#gid=(\d+)$/;
  const match = str.match(pattern);
  if (match) {
    // If the string ends with '#gid=sheetId', extract the sheetId value
    const sheetId = parseInt(match[1]);
    return sheetId;
  } else {
    // If the string does not end with '#gid=sheetId', return null
    return null;
  }
}


}

export default EditDataSource
