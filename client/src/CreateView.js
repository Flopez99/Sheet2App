import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DataSourceDropdown from './DataSourceDropdown';

const theme = createTheme();

function CreateView(props) {
  const [name, setName] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [dataSourceList, setDataSourceList] = useState([]);
  const [columns, setColumns] = useState([]);
  const [viewType, setViewType] = useState('TableView'); //TableView or DetailView
  const [addRecord, setAddRecord] = useState(false);
  const [editRecord, setEditRecord] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(false);
  const [roles, setRoles] = useState([]);
  const [filter, setFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [editFilter, setEditFilter] = useState('');
  const [editableColumns, setEditableColumns] = useState([]);

  const [columnSettings, setColumnSettings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/datasource_list1', {params: {
      appId: props.appId
      }})
      .then((response) => {
        console.log(response.data);
        setDataSourceList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    // Initialize column settings
    const initialSettings = [];
    for (let i = 1; i <= 5; i++) {
      initialSettings.push({ show: false, filter: false, userFilter: false });
    }


    setColumnSettings(initialSettings);
  }, []);

  useEffect(async  () => {
    const data_columns = [];
    console.log(selectedDataSource)
    await axios.get("http://localhost:8080/datasource", { params: {
        id: selectedDataSource
    }})
    .then((res) =>{ 
      console.log(res.data)
      var count = 0;
      for(const column of res.data.columns){
        data_columns.push({id: count, show: false, filter: false, userFilter: false , ...column})
        count++;
      }
      setColumnSettings(data_columns)
    })

  }, [selectedDataSource])

  const handleSubmit = (event) => {
    event.preventDefault();
    // Create a view model based on the input values
    const viewModel = {
      name: name,
      table: selectedDataSource,
      columns: columns,
      view_type: viewType,
      add_record: addRecord,
      edit_record: editRecord,
      delete_record: deleteRecord,
      roles: roles,
      filter: filter,
      user_filter: userFilter,
      edit_filter: editFilter,
      editable_columns: editableColumns,
    };
    fetch('http://localhost:8080/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewModel),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleColumnSettingChange = (index, field) => {
    const newSettings = [...columnSettings];
    newSettings[index][field] = !newSettings[index][field];
    setColumnSettings(newSettings);
  };

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
          <Typography component="h1" variant="h5">
            Create View
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <DataSourceDropdown
                  dataSourceList={dataSourceList}
                  selectedDataSource={selectedDataSource}
                  setSelectedDataSource={setSelectedDataSource}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  id="viewType"
                  label="View Type"
                  value={viewType}
                  onChange={(event) => setViewType(event.target.value)}
                >
                  <MenuItem value="TableView">Table View</MenuItem>
                  <MenuItem value="DetailView">Detail View</MenuItem>
                </TextField>
              </Grid>
              {viewType === 'TableView' && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={addRecord}
                        onChange={(event) => setAddRecord(event.target.checked)}
                      />
                    }
                    label="Allow Adding Records"
                  />
                </Grid>
              )}
              {viewType === 'DetailView' && (
                <Stack spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editRecord}
                          onChange={(event) => setEditRecord(event.target.checked)}
                        />
                      }
                      label="Allow Editing Records"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteRecord}
                          onChange={(event) => setDeleteRecord(event.target.checked)}
                        />
                      }
                      label="Allow Deleting Records"
                    />
                  </Grid>
                </Stack>
              )}
              <Grid item xs={12}>
                <TextField
                  name="roles"
                  fullWidth
                  id="roles"
                  label="Roles"
                  value={roles}
                  onChange={(event) => setRoles(event.target.value.split(','))}
                />
              </Grid>

              {viewType === 'TableView' && (
                <Grid item xs={12}>
                  <TableContainer component={Card}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>Column</TableCell>
                          <TableCell>Show?</TableCell>
                          <TableCell>Filter</TableCell>
                          <TableCell>User Filter</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {columnSettings.map((column, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {column.name}
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={column.show}
                                onChange={() => handleColumnSettingChange(index, 'show')}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={column.filter}
                                onChange={() => handleColumnSettingChange(index, 'filter')}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={column.userFilter}
                                onChange={() => handleColumnSettingChange(index, 'userFilter')}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
              {viewType === 'DetailView' && (
                <Grid item xs={12}>
                  <TableContainer component={Card}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>Column</TableCell>
                          <TableCell>Show?</TableCell>
                          <TableCell>Edit Filter</TableCell>
                          <TableCell>Editable Columns</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {columnSettings.map((column, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {column.name}
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={column.show}
                                onChange={() => handleColumnSettingChange(index, 'show')}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={column.filter}
                                onChange={() => handleColumnSettingChange(index, 'filter')}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={column.userFilter}
                                onChange={() => handleColumnSettingChange(index, 'userFilter')}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default CreateView;

                           

