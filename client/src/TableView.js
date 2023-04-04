import React from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function TableView({ view, sheetData }) {
  console.log(sheetData)
  //console.log(Object.keys(sheetData).length)
  const classes = useStyles();

  const allColumns = view.table.columns
  const shownColumns = view.columns
  const filteredColumns = allColumns.filter(column => shownColumns.includes(column._id));
  console.log(filteredColumns)

  const handleClickRecord = (record) => {

  }

  return (
    <div>
      <h2>{view.name}</h2>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {filteredColumns.map((column) => (
                <TableCell key={column._id}>{column.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Here we populate the rows with actual data */}
            {/* {typeof sheetData.sheet_data !== 'undefined' &&  (sheetData.sheet_data).map((record) => (
              <TableRow key={view._id} className={classes.tableRow} onClick={() => handleClickRecord(record)}>
                {filteredColumns.map((column, index) => (
                  <TableCell key={column._id}>{record[index] || ''}</TableCell>
                ))}
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default TableView;