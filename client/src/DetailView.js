

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import {Alert,  Dialog, DialogTitle, DialogContent, DialogContentText, Typography, DialogActions, TextField, Button, Stack, Container, Box, Divider } from '@mui/material';
import axios from 'axios';

const siteURL = process.env.SITE_URL || 'http://localhost:8080';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    marginTop: '20px',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    width: '100%',
  },
  fieldLabel: {
    minWidth: '120px',
    fontWeight: 'bold',
    textAlign: 'right',
    //backgroundColor: '#f0f0f0',
    padding: '5px',
    borderRadius: '4px',
    marginRight: '10px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '300px',
    marginTop: '20px',
  },
  centeredTextField: {
    '& input': {
      textAlign: 'center',
    },
  },
  recordBox: {
    //border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '5px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0'
  },
  divider: {
    width: '100%',
    marginBottom: '15px',
  },
});


function DetailView({ record, detailView, view, tableHeader, keyIndex, refreshSheetData, handleBackToTableView, allColumnsTypes }) { //view is the tableView which it comes from
  const [filteredColumns, setFilteredColumns] = useState([])
  const classes = useStyles();
  const [editedRecord, setEditedRecord] = useState(record);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFilterIndex, setEditFilterIndex] = useState(-1)
  const [allColumnsInTable, setAllColumnsInTable] = useState([])
  const [errorFlag, setErrorFlag] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
    useEffect(() => {
    console.log(record)
    console.log(detailView)
    const getFilteredColumns = async () => {
      const allColumns = detailView.table.columns;
      const shownColumns = detailView.columns
      const init_columns = allColumns
        .filter((column) => shownColumns.includes(column._id))
        .map((obj) => ({ ...obj, 
          index: tableHeader.findIndex((header) => header === obj.name), 
          editable: (detailView.editable_columns?.some((edit_col_id) => (edit_col_id === obj._id))?true:false )}));
    setFilteredColumns(init_columns)//filtered columns is going to filter column show
    const init_all_columns = allColumns
    .map((obj) => ({ ...obj, 
      index: tableHeader.findIndex((header) => header === obj.name), 
      editable: (detailView.editable_columns?.some((edit_col_id) => (edit_col_id === obj._id))?true:false )}));
    setAllColumnsInTable(init_all_columns)
    if(detailView.edit_filter !== null || detailView.edit_filter !== undefined){
      const init_edit_filter_index = tableHeader.findIndex(
        (header) => header === allColumns.find((col) => col._id == detailView.edit_filter).name,
      );
      setEditFilterIndex(init_edit_filter_index);
    }
    else{
      setEditFilterIndex(-1);
    }
    //and also have attribue if editable

    };
    getFilteredColumns();
  }, [record,detailView, view, tableHeader])

  const handleEditField = (event) => {
    setEditedRecord({
      ...editedRecord,
      [event.target.name]: event.target.value,
    });
  };
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleConfirmDeleteRecord = () => {
    handleDeleteRecord(record, record[keyIndex]);
    handleCloseDeleteDialog();
  };

  const handleSaveChanges = async () => {
    console.log(editedRecord)
    console.log(allColumnsInTable)
    for await (const colmn of allColumnsInTable){
      console.log(colmn)

      if(!(editedRecord[colmn.index])){ // the columns not added by User
        //editedRecord[colmn.index] = ""

        if(!(colmn.editable)){//checks if it wasnt editable to add initial values
          if(colmn.initial_value !== "=ADDED_BY()"){ //if special case of ADDED_BY
            console.log("in edit")
            console.log(colmn.init_value)
            editedRecord[colmn.index] = colmn.initial_value
          }
        }
        else{
          editedRecord[colmn.index] = ""
        }

      }
      else if((!colmn.editable) && colmn.initial_value !== "=ADDED_BY()" && colmn.initial_value !== ""){
        editedRecord[colmn.index] = colmn.initial_value
      }
    }

    let record_list = Object.values(editedRecord)
    var sheetId = getIdFromUrl(detailView.table.url);
    var sheetIndex = detailView.table.sheet_index
    console.log(allColumnsTypes) //now we have to just check all values with this order
    console.log(record_list)
    console.log(editedRecord)
    
    try{
      const response = await axios.post(`${siteURL}/api/edit_record`, {
        sheet_url: detailView.table.url,
        record: record_list,
        prevHeader: tableHeader,
        keyIndex: keyIndex,
        keyValue: record[keyIndex],
        typeList: allColumnsTypes
      })
      if (response.data.success) {
        console.log(response.data.message);
        setErrorFlag(false)
        refreshSheetData(detailView.table)
        handleBackToTableView()

        // Update the SheetData and re-render in DisplayApp 
        // We can call a function passed down as a prop to refresh the data?
      } else {
        setErrorMsg(response.data.message)
        setErrorFlag(true)
        console.log('Error adding record:', response.data.message);
      }
    }
    catch(error) {
      console.error('Error sending data to the server:', error);
    }
    setEditing(false);
  };

  const handleDeleteRecord = async () => {
    var sheetId = getIdFromUrl(detailView.table.url);
    var sheetIndex = detailView.table.sheet_index
    try{
      const response = await axios.post(`${siteURL}/api/delete_record`, {
        sheet_url: detailView.table.url,
        prevHeader: tableHeader,
        keyIndex: keyIndex,
        keyValue: record[keyIndex]
      })
      if (response.data.success) {
        refreshSheetData(detailView.table)
        handleBackToTableView()

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

  const handleEditButtonClick = () => {
    setEditing(true);
  };

  if(filteredColumns.length === 0){
    return (
      <div>
        Loading or No Columns Shown In Detail View
      </div>
    )
  }
  console.log('DetailView:', detailView);



  return (
    <Container maxWidth="sm" component={Box} className={classes.root} elevation = {4}>
      {errorFlag && <Alert severity="error">{errorMsg}</Alert>}
      <Typography variant="h4" gutterBottom>Record Details</Typography>
      <Divider className={classes.divider} />
      {filteredColumns.map((col, index) => {
        if(true){
        return (
        <div key={col._id} className={classes.fieldContainer}>
          <Typography variant="subtitle1" className={classes.fieldLabel}>
            {col.name + " : "}
          </Typography>
          {editing ? (
            <TextField
              className={classes.centeredTextField}
              variant="outlined"
              size="small"
              name={col.index}
              value={editedRecord[col.index]}
              onChange={handleEditField}
              disabled={!(col.editable)}
              fullWidth
            />
          ) : (
            <Box className={classes.recordBox}>
              <Typography variant="subtitle1" align="center">
                {record[col.index]}
              </Typography>
             </Box>
          )}
        </div>
      )}}
      )}
      <Stack direction="row" spacing={2} className={classes.buttonContainer}>
      {(editFilterIndex === -1 || record[editFilterIndex] === 'TRUE') && detailView.edit_record &&
      (editing ? (
          <Button variant="contained" color="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        ) : (
          <Button variant="outlined" color="primary" onClick={handleEditButtonClick}>
            Edit
          </Button>
        ))
      }
      {detailView.delete_record &&
        <Button variant="contained" sx={{bgcolor: "error.main"}} onClick={handleOpenDeleteDialog}>
          Delete Record
        </Button>
      }
      </Stack>
      <Container maxWidth="md">
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Delete Record?"}</DialogTitle>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this record?
          </DialogContentText>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              No
            </Button>
            <Button onClick={handleConfirmDeleteRecord} color="primary" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Container>
  );
  function getIdFromUrl(url) {
    const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

export default DetailView;
