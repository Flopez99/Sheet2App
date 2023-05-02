import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Stack, Container, Grid, Button, Box, Alert } from '@mui/material';
import { Dialog, DialogTitle, DialogContent,DialogContentText, TextField, DialogActions } from '@mui/material';
import { Link } from 'react-router-dom';
import { teal } from '@mui/material/colors';
import axios from 'axios';
import { buildAggregatedQuickFilterApplier } from '@mui/x-data-grid/hooks/features/filter/gridFilterUtils';


const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },  
  header: {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  deleteColumn: {
    width: '80px', // Adjust the width to your preference
    padding: 0,
    textAlign: 'center',
  },
  fullWidthButton: {
    padding: 0,
    width: '100%',
  },
});

function TableView({ view, sheetData, onClickRecord, userEmail, detailView, refreshSheetData, all_sheets, all_detail_views, onClickRefRecord }) {
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [datasource, setDatasource] = useState({});
  const [keyIndex, setKeyIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState(-1);
  const [userFilterIndex, setUserFilterIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [allColumnsInTable, setAllColumnsInTable] = useState([])
  const [allColumnTypes, setAllColumnTypes] =useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [allDetailViews, setAllDetailViews] = useState([])
  const [allSheets, setAllSheets] = useState([])
  const [errorFlag, setErrorFlag] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const getFilteredColumns = async () => {
      const allColumns = view.table.columns;
      const shownColumns = view.columns;
      var headers = sheetData.sheet_data[0];
      let key_col = allColumns.find((column) => (column._id === sheetData.key));
      let key_index = headers.findIndex((header) => header === key_col.name);
      const init_columns = allColumns
        .filter((column) => shownColumns.includes(column._id))
        .map((obj) => ({ ...obj, index: headers.findIndex((header) => header === obj.name) }));
      //checks view.filter
      if (view?.filter !== undefined) {
        console.log('yes filter');
        const init_filter_index = headers.findIndex(
          (header) => header === allColumns.find((col) => col._id == view.filter).name,
        );
        setFilterIndex(init_filter_index);
      } 
      else {
        setFilterIndex(-1);
      }
      //checks user_filter
      if (view?.user_filter !== undefined) {
        const user_filter_index = headers.findIndex(
          (header) => header === allColumns.find((col) => col._id == view.user_filter).name,
        );
        console.log(user_filter_index);
        setUserFilterIndex(user_filter_index);
      } else {
        setUserFilterIndex(-1);
      }

      //creating addRecordColumns
      const init_all_columns = allColumns.map((obj) => ({ ...obj, 
        index: headers.findIndex((header) => header === obj.name), 
        editable: (detailView?.editable_columns?.some((edit_col_id) => (edit_col_id === obj._id))?true:false )}));
      console.log(init_all_columns)
      let init_column_type = alignAndExtractTypes(init_all_columns)
      setAllColumnTypes(init_column_type)
      console.log(init_column_type)
      setAllColumnsInTable(init_all_columns)
      setKeyIndex(key_index);
      setFilteredColumns(init_columns);
      setDatasource(sheetData);
      setAllDetailViews(all_detail_views)
      setAllSheets(all_sheets)
    };
    getFilteredColumns();
  }, [view, sheetData, detailView, all_detail_views, all_sheets]);

  const classes = useStyles();

  const handleClickRecord = (record, other, header, key_index, all_col_types) => {
    onClickRecord(record, other, header, key_index, all_col_types);
  };

  const handleClickRefRecord = (record, other, header, key_index, all_col_types, ref_detail_view) => {
    onClickRefRecord(record, other, header, key_index, all_col_types, ref_detail_view);
  };

  const handleAddRecord = () => {
    console.log('Add Record Button Clicked');
    setOpen(true);
  };

  const handleOpenDeleteDialog = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setRecordToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDeleteRecord = () => {
    handleDeleteRecord(recordToDelete, recordToDelete[keyIndex]);
    handleCloseDeleteDialog();
  };

  const handleDeleteRecord = async (record1, key_index) => {
    var sheetId = getIdFromUrl(view.table.url);
    var sheetIndex = view.table.sheet_index

    try{
      const response = await axios.post("http://localhost:8080/api/delete_record", {
        sheet_url: view.table.url,
        prevHeader: sheetData.sheet_data[0],
        keyIndex: keyIndex,
        keyValue: record1[keyIndex]
      })
      if (response.data.success) {
        console.log("NEW DATAAAA")
        setErrorFlag(false)
        refreshSheetData(view.table)

        // Update the SheetData and re-render in DisplayApp 
        // We can call a function passed down as a prop to refresh the data?
      } else {
        console.log('Error adding record:', response.data.message);
        setErrorMsg(response.data.message)
        setErrorFlag(true)
      }
    }
    catch(error) {
      console.error('Error sending data to the server:', error);
      setErrorMsg(error)
      setErrorFlag(true)

    }

  };
  const handleSubmit = async () => {
    console.log('Submit new record:', newRecord);
    var sheetId = getIdFromUrl(view.table.url);
    var sheetIndex = view.table.sheet_index
    var all_col_types = allColumnTypes
    //adding inital values, and setting other variables as ""
    for await (const colmn of allColumnsInTable){
      if(!(newRecord[colmn.index])){ // the columns not added by User
        if(!(colmn.editable)){//checks if it wasnt editable to add initial values
          if(colmn.initial_value === "=ADDED_BY()"){ //if special case of ADDED_BY
            newRecord[colmn.index] = userEmail
          }
          else{
            newRecord[colmn.index] = colmn.initial_value
          }
        }
        else{
          newRecord[colmn.index] = ""
        }
      }
    }

    
    console.log('Submit new record2:', newRecord);
    let record_list = Object.values(newRecord)


    try {
      const response = await axios.post('http://localhost:8080/addRecord', {
        sheet_url: view.table.url,
        record: record_list,
        prevHeader: sheetData.sheet_data[0],
        keyIndex: keyIndex,
        typeList: allColumnTypes
      });
      console.log('in try)')
      if (response.data.success) {
        console.log(response.data.message);
        setErrorFlag(false)
        // Update the SheetData and re-render in DisplayApp 
        // We can call a function passed down as a prop to refresh the data?
        refreshSheetData(view.table)

      } else {
        console.log('Error adding record:', response.data.message);
        setErrorMsg(response.data.message)
        setErrorFlag(true)
      }
    } catch (error) {
      console.error(error);

      // Access error property if it exists
      if (error.json && typeof error.json === 'object' && error.json.hasOwnProperty('error')) {
        console.error(`Server error: ${error.json.error}`);
      }
    }
    setOpen(false);
    setNewRecord({});
  };
  

  if (filteredColumns.length === 0) {
    return <div>Loading views...</div>;
  } else {
    console.log(filteredColumns);
  }

  console.log('allow add record?: ',view.add_record);
  //view.add_record = false;

  return (
    <Stack spacing={5}>
      <Box textAlign="center">
        <Typography variant="h4" component="h2">
          {view.name}
        </Typography>
        {errorFlag && <Alert severity="error">{errorMsg}</Alert>}
      </Box>
      <Typography alignItems="center">
        <Container>
          <Box>
            <TableContainer component={Paper} elevation={4}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {filteredColumns.map((column) => (
                      <TableCell key={column._id} className={classes.header}>
                        {column.name}
                      </TableCell>
                    ))}
                    {view.delete_record && (
                      <TableCell className={classes.header}>Delete</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {typeof sheetData.sheet_data !== 'undefined' &&
                    sheetData.sheet_data.slice(1).map((record) => {
                      if (
                        (filterIndex === -1 || record[filterIndex] === 'TRUE') &&
                        (userFilterIndex === -1 || record[userFilterIndex] === userEmail)
                      ) {
                        return (
                          <TableRow
                            key={record[keyIndex]}
                            className={classes.tableRow}
                            onClick={() => handleClickRecord(record, record[keyIndex], sheetData.sheet_data[0], keyIndex, allColumnTypes)}
                          >
                            {filteredColumns.map((column) => {
                              if (column.type === "URL") {
                                return (
                                  <TableCell key={column._id}>
                                    <a href={record[column.index]} target="_blank" rel="noreferrer">
                                      {record[column.index]}
                                    </a>
                                  </TableCell>
                                );
                              }
                              else if(column?.references !== null){
                                var refDetailView = allDetailViews.find(detailView => detailView.table._id === column.references)
                                var refDataSource = allSheets.find(sheet => sheet._id === column.references)
                                console.log(refDataSource)
                                //record, other, sheetData.sheet_data[0], keyIndex, allColumnTypes
                                if(refDataSource !== undefined){
                                  var allRefColumns = refDataSource.columns;
                                  var refHeader = refDataSource.sheet_data[0]
                                  allRefColumns = allRefColumns.map((obj) => ({ ...obj, 
                                    index: refHeader.findIndex((header) => header === obj.name) }))//sets index
                                  var ref_key_index = allRefColumns.find((column) => (column._id === refDataSource.key))?.index;
                                  console.log(ref_key_index)
                                  var ref_record_index = findRowIndex(refDataSource.sheet_data, ref_key_index, record[column.index])
                                  if(ref_record_index === -1)
                                    return (<TableCell key={column._id}>{record[column.index] || ''}</TableCell> );
                                  var ref_record = refDataSource.sheet_data[ref_record_index];
                                  var label_index = allRefColumns.find(column => column.label === true).index
                                  var all_ref_column_type = alignAndExtractTypes(allRefColumns)
                                  console.log(all_ref_column_type)
                                  if(refDetailView !== undefined){
                                    console.log(refDetailView)
                                    return (
                                    <TableCell className={classes.deleteColumn}>
                                    <Button
                                      variant="outlined"
                                      
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleClickRefRecord(ref_record, ref_record[ref_key_index], refHeader, ref_key_index, all_ref_column_type, refDetailView)
                                      }}
                                    >
                                      {ref_record[label_index]|| ""}
                                    </Button>
                                  </TableCell>
                                  )
                                  }
                                  else{
                                    return (<TableCell key={column._id}>{ref_record[label_index]|| ""}</TableCell>);
                                  }
                                }
                            
                                return (<TableCell key={column._id}>{record[column.index] || ''}</TableCell> );
                              } 
                              else {
                                return (
                                  <TableCell key={column._id}>{record[column.index] || ''}</TableCell>
                                );
                              }
                            })}
                            {view.delete_record && (
                              <TableCell className={classes.deleteColumn}>
                                <Button
                                  variant="outlined"
                                  color = "error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleOpenDeleteDialog(record);
                                  }}
                                >
                                  X
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );                        
                      }
                    })}
                </TableBody>
                {view.add_record && (
                  <TableRow>
                    <TableCell colSpan={filteredColumns.length}>
                      <Button variant="outlined" color="secondary" onClick={handleAddRecord}>
                        Add Record
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Typography>   
      {/* POP UP HAPPENING HERE TO ADD DATA FOR NEW RECORD*/}  
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="add-record-dialog">
        <DialogTitle id="add-record-dialog">Add New Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {allColumnsInTable.map((column) => {
              if(column.editable){
                return(
                  <Grid item xs={12} key={column._id}>
                    <TextField
                      label={column.name}
                      fullWidth
                      value={newRecord[column.index] || ''}
                      onChange={(e) => setNewRecord({ ...newRecord, [column.index]: e.target.value })}
                    />
                  </Grid>
                )}
              }
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Record?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this record?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDeleteRecord} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  ); 
  function getIdFromUrl(url) {
    const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } 
  function alignAndExtractTypes(arr) {
    // Sort the array by index
    arr.sort((a, b) => a.index - b.index);
  
    // Extract the type of each object
    const types = arr.map(obj => obj.type);

      // Check if obj.editable is false and obj.initial_value is not an empty string
      types.forEach((obj, index) => {
      if (!obj.editable && obj.initial_value !== "") {
        types[index] = "initial_value";
      }
    });

    console.log(types)
  
    return types;
  }
  function findRowIndex(arr, keyColumn, keyValue) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i][keyColumn] === keyValue) {
        return i;
      }
    }
    // return -1 if no row with matching key value was found
    return -1;
  }
}

export default TableView;
