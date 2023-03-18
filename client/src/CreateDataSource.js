import React from 'react'

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { DataGrid, GridRowsProp, GridColDef, GridValueGetterParams  } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';


function CreateDataSource() {
  const theme = createTheme();
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };
  const rows = [
    { id: 1, column: 'Student', initialValue: '=Jose', label: false, reference: "", type: 'String' },
    { id: 2, column: 'Test1', initialValue: '=0', label: false, reference: "", type: 'Num' },
    { id: 3, column: 'Test2', initialValue: '=0', label: false, reference: "", type: 'Num' },
    { id: 4, column: 'HW1', initialValue: '=0', label: false, reference: "", type: 'Num' },
    { id: 5, column: 'HW2', initialValue: '=0', label: false, reference: "", type: 'Num' },
    { id: 6, column: 'Male', initialValue: '=FALSE', label: false, reference: "", type: 'Bool' },
  ];
  const columns  = [
      { field: 'id', headerName: 'ID', width: 90 },
      {
        field: 'column',
        headerName: 'Column  name',
        width: 150,

      },
      {
        field: 'initialValue',
        headerName: 'Initial Value',
        width: 150,
        editable: true,
        type: 'string'
      },
      {
        field: 'label',
        headerName: 'label',
        type: 'boolean',
        width: 110,
        editable: true,
      },
      {
        field: 'reference',
        headerName: 'reference',
        type: 'string',
        width: 110,
        editable: true,
      },
      {
        field: 'type',
        headerName: 'type',
        type: 'string',
        width: 110,
      },
    ];
  return (
    <ThemeProvider theme={theme}>
    <Container component="main" maxWidth="xs">
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
        <Box component="form" noValidate  sx={{ mt: 3 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12}>
              <TextField
                name="Data Source Name"
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
            type="generateColumns"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Generate Column
          </Button>
          <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Create
          </Button>
        </Box>
      </Box>
    </Container>
  </ThemeProvider>
  )
}

export default CreateDataSource
