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

function CreateDataSource() {
  const theme = createTheme();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const spreadsheetUrl = data.get('spreadsheeturl');
    const sheetIndex = data.get('sheetindex');

    const sheetId = getIdFromUrl(spreadsheetUrl);

    if (sheetId) {
      console.log(sheetId);
      console.log(sheetIndex);

      const sheetData = await fetchSheetData(sheetId, sheetIndex);
      if (sheetData) {
        setColumns(sheetData.columns);
        setRows(sheetData.rows);
      }
    } else {
      console.log('Invalid URL');
    }
  };

  // ... Rest of your component code

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
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Generate Columns
            </Button>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkbox
                checkboxSelection
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

// Function to generate column definitions for DataGrid from the header row
function generateColumns(headerRow) {
  return headerRow.map((columnName, index) => ({
    field: `col${index}`,
    headerName: columnName,
    width: 150,
    editable: true,
  }));
}

// Function to generate row data for DataGrid from the remaining rows
function generateRows(dataRows) {
  return dataRows.map((row, rowIndex) => {
    const rowData = {};
    row.forEach((cellValue, cellIndex) => {
      rowData[`col${cellIndex}`] = cellValue;
    });
    return { id: rowIndex, ...rowData };
  });
}

// Function to fetch the sheet data from your server
async function fetchSheetData(sheetId, sheetIndex) {
  const response = await fetch(
    `/api/fetchSheetData/${sheetId}/${sheetIndex}`
  );
  console.log(response);
  console.log(await response.text()); // log the response body
  

  if (response.ok) {
    const data = await response.json();
    console.log(data);
    const columns = generateColumns(data.values[0]);
    const rows = generateRows(data.values.slice(1));
    return { columns, rows };
  } else {
    console.error('Error fetching sheet data:', response.statusText);
    return null;
  }
}

function getIdFromUrl(url) {
  const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default CreateDataSource;

