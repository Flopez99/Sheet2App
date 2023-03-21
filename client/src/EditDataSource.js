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



function EditDataSource({datasource_id, appId}) {
const navigate = useNavigate();
  console.log("Hi")
  console.log(datasource_id)
  const { apiRef, columns } = useApiRef();
  const [datasource, setDatasource] = useState({})
  const [datasource_name, setDatasource_name] = useState("")
  const [labelError, setLabelError] = useState(false)
  const [typeError, setTypeError] = useState(false)
  const [rows1, setRows1] = useState({})
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
            rows1.push({id: count, ...column})
            count++;
        }
        await axios.get("http://localhost:8080/api/fetchSheetData" , {params : {
            sheetId: sheetId,
            sheetIndex: sheetIndex
        }})
        .then((res) => {
            const headers = res.data.values[0];
            console.log(headers);
            generateRows(headers, rows1)
            console.log(rows1)
            setRows1(rows1);
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
  const handleUpdate = async() => {
    console.log(apiRef.current.getRowModels());
    var rowModel = await apiRef.current.getRowModels()
    var array =  Array.from(rowModel, ([key, value]) =>({value}));
    //check if multiple Label
    var boolFlag = true
    boolFlag = boolFlag && checkType(array);
    var label_row 
    if(label_row= checkLabel(array) === null)
      boolFlag = false;
    if(boolFlag){
        let new_columns = []
        var key_column;
        for(const column of array){
            if(typeof column.value._id === 'undefined'){
                //new Column
                console.log(column.value)
                await axios.post("http://localhost:8080/column", {
                    name: column.value.name,
                    initial_value: column.value.initial_value,
                    label: column.value.label,
                    //references  STILL GOT TO IMPLEMENT
                    type: column.value.type
                  })
                  .then((res) => {
                    if(column.value.label === true)
                      key_column = res.data._id
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
                    //references  STILL GOT TO IMPLEMENT
                    type: column.value.type
                }
                })
                .then((res) => {
                if(column.value.label === true)
                    key_column = res.data._id
                })

            }
            //creates datasource
            console.log(" name: " + datasource_name)
            await axios.post("http://localhost:8080/updateDatasource", {
                datasourceId: datasource_id,
                name: datasource_name,
                key: key_column,
                columns: new_columns,
                consistent: true
            })
            .then((res) => {
                console.log(res.data._id)
                console.log(appId)
                navigate("/editApp",{state: appId} )
            })
          }

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
        <Box sx={{ height: 400, width: '100%'}}>
        {Object.keys(rows1).length !== 0 && (
            <DataGrid
              rows={rows1}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkbox
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
  async function generateRows(dataRows, rows){
    let size = rows.length
    for(const header of dataRows ){
        let doesExistFlag = false;
        rows.forEach((column) => {
            if(column.name === header)
                doesExistFlag = true;
        })
        if(!doesExistFlag){
            console.log("Im here")
            rows.push({id: size, name: header, 
                initial_value: "", label: false, reference: "", type: "" })
            size++;
        }
    }
    console.log(rows)
    return rows;
  }

function getIdFromUrl(url) {
  const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
}

export default EditDataSource
