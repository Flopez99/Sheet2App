import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Stack, Container, Grid, Button, Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';


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

function TableView({ view, sheetData, onClickRecord, userEmail, detailView, refreshSheetData }) {
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [datasource, setDatasource] = useState({});
  const [keyIndex, setKeyIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState(-1);
  const [userFilterIndex, setUserFilterIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [allColumnsInTable, setAllColumnsInTable] = useState([])
  const [allColumnTypes, setAllColumnTypes] =useState([])

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
    };
    getFilteredColumns();
  }, [view, sheetData, detailView]);

  const classes = useStyles();

  const handleClickRecord = (record, other) => {
    onClickRecord(record, other, sheetData.sheet_data[0], keyIndex, allColumnTypes);
  };

  const handleAddRecord = () => {
    console.log('Add Record Button Clicked');
    setOpen(true);
  };

  const handleDeleteRecord = async (record1, key_index) => {
    var sheetId = getIdFromUrl(view.table.url);
    var sheetIndex = view.table.sheet_index

    try{
      const response = await axios.post("http://localhost:8080/api/delete_record", {
        sheetId: sheetId, 
        sheetIndex: sheetIndex,
        prevHeader: sheetData.sheet_data[0],
        keyIndex: keyIndex,
        keyValue: record1[keyIndex]
      })
      if (response.data.success) {
        console.log("NEW DATAAAA")
        refreshSheetData(view.table)

        // Update the SheetData and re-render in DisplayApp 
        // We can call a function passed down as a prop to refresh the data?
      } else {
        console.log('Error adding record:', response.data.message);
      }
    }
    catch(error) {
      console.error('Error sending data to the server:', error);
    }

  };
  const handleSubmit = async () => {
    console.log('Submit new record:', newRecord);
    var sheetId = getIdFromUrl(view.table.url);
    var sheetIndex = view.table.sheet_index
    //adding inital values, and setting other variables as ""
    for await (const colmn of allColumnsInTable){
      if(!(newRecord[colmn.index])){ // the columns not added by User
        if(!(colmn.editable)){//checks if it wasnt editable to add initial values
          if(colmn.initial_value === "=ADDED_BY()") //if special case of ADDED_BY
            newRecord[colmn.index] = userEmail
          else
            newRecord[colmn.index] = colmn.initial_value
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
        sheetId: sheetId, 
        sheetIndex: sheetIndex,
        record: record_list,
        prevHeader: sheetData.sheet_data[0],
        keyIndex: keyIndex,
      });
  
      if (response.data.success) {
        console.log(response.data.message);
        // Update the SheetData and re-render in DisplayApp 
        // We can call a function passed down as a prop to refresh the data?
        refreshSheetData(view.table)

      } else {
        console.log('Error adding record:', response.data.message);
      }
    } catch (error) {
      console.error('Error sending data to the server:', error);
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
                            onMouseUp={() => handleClickRecord(record, record[keyIndex])}                          >
                            {filteredColumns.map((column) => {
                                if(column.type === "URL"){
                                  return(<TableCell key={column._id}>
                                    <a href={record[column.index]} target="_blank" rel="noreferrer">{record[column.index]}</a>
                                  </TableCell>)
                                }
                                else{
                                  return (<TableCell key={column._id}>{record[column.index] || ''}</TableCell>)
                                }
                              }
                            )}
                            {view.delete_record && (
                              <TableCell className={classes.deleteColumn}>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteRecord(record, record[keyIndex]);
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
  
    return types;
  }
}

export default TableView;
