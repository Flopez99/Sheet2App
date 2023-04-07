import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Stack, Container, Grid, Button, Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

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
});

function TableView({ view, sheetData, onClickRecord, userEmail }) {
  console.log(sheetData);
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [datasource, setDatasource] = useState({});
  const [keyIndex, setKeyIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState(-1);
  const [userFilterIndex, setUserFilterIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({});


  useEffect(() => {
    const getFilteredColumns = async () => {
      console.log(userEmail);
      console.log('IN GETFITERED COLUMNS');
      const allColumns = view.table.columns;
      const shownColumns = view.columns;
      var headers = sheetData.sheet_data[0];
      console.log(headers);
      console.log(allColumns);
      let key_col = allColumns.find((column) => (column._id = sheetData.key));
      let key_index = headers.findIndex((header) => header === key_col.name);
      console.log(key_index);
      const init_columns = allColumns
        .filter((column) => shownColumns.includes(column._id))
        .map((obj) => ({ ...obj, index: headers.findIndex((header) => header === obj.name) }));
      //checks view.filter
      if (view.filter !== undefined) {
        console.log('yes filter');
        const init_filter_index = headers.findIndex(
          (header) => header === allColumns.find((col) => col._id == view.filter).name,
        );
        setFilterIndex(init_filter_index);
      } else {
        setFilterIndex(-1);
      }
      //checks user_filter
      if (view.user_filter !== undefined) {
        const user_filter_index = headers.findIndex(
          (header) => header === allColumns.find((col) => col._id == view.user_filter).name,
        );
        console.log(user_filter_index);
        setUserFilterIndex(user_filter_index);
      } else {
        setUserFilterIndex(-1);
      }
      console.log(view);
      console.log(init_columns);
      setKeyIndex(key_index);
      setFilteredColumns(init_columns);
      setDatasource(sheetData);
    };
    getFilteredColumns();
  }, [view, sheetData]);
  // useEffect(() => {
  //   const getSheetData = async () => {
  //     setDatasource(sheetData)
  //   };
  //   getSheetData();
  // }, [sheetData])
  //console.log(Object.keys(sheetData).length)
  const classes = useStyles();
  //const header = sheetData[0]
  // const allColumns = view.table.columns
  // const shownColumns = view.columns
  //const filteredColumns = allColumns.filter(column => shownColumns.includes(column._id));//.map(obj => ({ ...obj, index: header.findIndex(obj.name)}));
  // console.log(filteredColumns)

  const handleClickRecord = (record, other) => {
    onClickRecord(record, other);
  };

  const handleAddRecord = () => {
    console.log('Add Record Button Clicked');
    setOpen(true);
  };

  const handleSubmit = () => {
    console.log('Submit new record:', newRecord);
    // Logic to be added to push the data to the server
    // Update the SheetData and re-render in DisplayApp ig
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
                            onClick={() => handleClickRecord(record, record[keyIndex])}
                          >
                            {filteredColumns.map((column) => (
                              <TableCell key={column._id}>{record[column.index] || ''}</TableCell>
                            ))}
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
            {filteredColumns.map((column) => (
              <Grid item xs={12} key={column._id}>
                <TextField
                  label={column.name}
                  fullWidth
                  value={newRecord[column.index] || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, [column.index]: e.target.value })}
                />
              </Grid>
            ))}
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
}

export default TableView;
