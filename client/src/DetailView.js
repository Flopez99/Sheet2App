// import React, { useState } from 'react';
// import { makeStyles } from '@mui/styles';
// import { Typography, TextField, Button, Stack, Container, Box } from '@mui/material';

// const useStyles = makeStyles({
//   root: {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: '20px',
//     borderRadius: '8px',
//     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
//     backgroundColor: '#fff',
//     marginTop: '20px',
//   },
//   fieldContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginBottom: '15px',
//   },
//   fieldLabel: {
//     minWidth: '120px',
//     marginBottom: '5px',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     width: '100%',
//     maxWidth: '300px',
//     marginTop: '20px',
//   },
// });

// function DetailView({ record, detailView, view }) {
//   const classes = useStyles();
//   const [editedRecord, setEditedRecord] = useState(record);
//   const [editing, setEditing] = useState(false);

//   const isColumnEditable = (key) => {
//     if (!detailView.table) return false;
//     const column = detailView.table.columns.find((column) => column.name === key);  //detailView is empty for some reason so it can't look for the column names
//     return detailView.editable_columns.includes(column._id);
//   };

//   const handleEditField = (event) => {
//     setEditedRecord({
//       ...editedRecord,
//       [event.target.name]: event.target.value,
//     });
//   };

//   const handleSaveChanges = () => {
//     console.log('Record updated:', editedRecord);
//     setEditing(false);
//   };

//   const handleDeleteRecord = () => {
//     console.log('Record deleted:', record);
//   };

//   const handleEditButtonClick = () => {
//     setEditing(true);
//   };
//   console.log('DetailView:', detailView);

//   return (
//     <Container maxWidth="sm" component={Box} className={classes.root}>
//       <Typography variant="h4">Record Details</Typography>
//       {Object.keys(record).map((key, index) => (
//         <div key={key} className={classes.fieldContainer}>
//           <Typography variant="subtitle1" className={classes.fieldLabel}>
//             {view.table.columns[index].name}
//           </Typography>
//           {editing ? (
//             <TextField
//               variant="outlined"
//               size="small"
//               name={key}
//               value={editedRecord[key]}
//               onChange={handleEditField}
//               disabled={!isColumnEditable(view.table.columns[index].name)}
//             />
//           ) : (
//             <Typography variant="subtitle1">{record[key]}</Typography>
//           )}
//         </div>
//       ))}
//       <Stack direction="row" spacing={2} className={classes.buttonContainer}>
//         {editing ? (
//           <Button variant="contained" color="primary" onClick={handleSaveChanges}>
//             Save Changes
//           </Button>
//         ) : (
//           <Button variant="outlined" color="primary" onClick={handleEditButtonClick}>
//             Edit
//           </Button>
//         )}
//         <Button variant="contained" color="secondary" onClick={handleDeleteRecord}>
//           Delete Record
//         </Button>
//       </Stack>
//     </Container>
//   );
// }

// export default DetailView;

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Typography, TextField, Button, Stack, Container, Box, Divider } from '@mui/material';

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


function DetailView({ record, detailView, view, tableHeader }) { //view is the tableView which it comes from
  const [filteredColumns, setFilteredColumns] = useState([])
  const classes = useStyles();
  const [editedRecord, setEditedRecord] = useState(record);
  const [editing, setEditing] = useState(false);
  const [editFilterIndex, setEditFilterIndex] = useState(-1)
  console.log(detailView)
  console.log(record)
  console.log(view)
    useEffect(() => {
    const getFilteredColumns = async () => {
      const allColumns = detailView.table.columns;
      const shownColumns = detailView.columns
      const init_columns = allColumns
        .filter((column) => shownColumns.includes(column._id))
        .map((obj) => ({ ...obj, 
          index: tableHeader.findIndex((header) => header === obj.name), 
          editable: (detailView.editable_columns?.some((edit_col_id) => (edit_col_id === obj._id))?true:false )}));
    setFilteredColumns(init_columns)//filtered columns is going to filter column show
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
  // const isColumnEditable = (key) => {
  //   if (!detailView.table) return false;
  //   const column = detailView.table.columns.find((column) => column.name === key);  //detailView is empty for some reason so it can't look for the column names
  //   return detailView.editable_columns.includes(column._id);
  // };

  const handleEditField = (event) => {
    console.log(editedRecord)
    console.log(event.target.name) //name === index in record that is being changed
    console.log(event.target.value)
    setEditedRecord({
      ...editedRecord,
      [event.target.name]: event.target.value,
    });
  };

  const handleSaveChanges = () => {
    console.log('Record updated:', editedRecord);
    setEditing(false);
  };

  const handleDeleteRecord = () => {
    console.log('Record deleted:', record);
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
      <Typography variant="h4" gutterBottom>Record Details</Typography>
      <Divider className={classes.divider} />
      {/* {Object.keys(record).map((key, index) => {
        if(true){
        return (
        <div key={key} className={classes.fieldContainer}>
          <Typography variant="subtitle1" className={classes.fieldLabel}>
            {view.table.columns[index].name + " : "}
          </Typography>
          {editing ? (
            <TextField
              className={classes.centeredTextField}
              variant="outlined"
              size="small"
              name={key}
              value={editedRecord[key]}
              onChange={handleEditField}
              disabled={!isColumnEditable(view.table.columns[index].name)}
              fullWidth
            />
          ) : (
            <Box className={classes.recordBox}>
              <Typography variant="subtitle1" align="center">
                {record[key]}
              </Typography>
             </Box>
          )}
        </div>
      )}}
      )} */}
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
        <Button variant="contained" color="secondary" onClick={handleDeleteRecord}>
          Delete Record
        </Button>
      }
      </Stack>
    </Container>
  );
}

export default DetailView;
