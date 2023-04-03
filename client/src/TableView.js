import React from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function TableView({ view }) {
  const classes = useStyles();

  const allColumns = view.table.columns
  const shownColumns = view.columns
  const filteredColumns = allColumns.filter(column => shownColumns.includes(column._id));

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
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default TableView;