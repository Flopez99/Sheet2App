import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Typography, TextField, Button } from '@mui/material';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10px',
  },
  fieldLabel: {
    marginRight: '10px',
    fontWeight: 'bold',
  },
});

function DetailView({ record, detailView}) {
  const classes = useStyles();
  const [editedRecord, setEditedRecord] = useState(record);

  console.log(detailView)
  const handleEditField = (event) => {
    setEditedRecord({
      ...editedRecord,
      [event.target.name]: event.target.value,
    });
  };

  const handleSaveChanges = () => {
    console.log('Record updated:', editedRecord);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4">Record Details</Typography>
      {Object.keys(record).map((key) => (
        <div key={key} className={classes.fieldContainer}>
          {detailView.edit_record ? (
            <TextField
              variant="outlined"
              size="small"
              name={key}
              value={editedRecord[key]}
              onChange={handleEditField}
            />
          ) : (
            <Typography variant="subtitle1">{record[key]}</Typography>
          )}
        </div>
      ))}
      {detailView.edit_record && (
        <Button variant="contained" color="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      )}
    </div>
  );
}

export default DetailView;