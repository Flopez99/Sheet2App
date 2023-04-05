import React, { useEffect, useState} from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, cardHeaderClasses } from '@mui/material';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function TableView({ view, sheetData, onClickRecord }) {
  console.log(sheetData)
  const [filteredColumns, setFilteredColumns] = useState([])
  const [datasource, setDatasource] = useState({})
  const [keyIndex, setKeyIndex] = useState(0)

  useEffect(() => {
    const getFilteredColumns = async () => { 
      console.log('IN GETFITERED COLUMNS')
      const allColumns = view.table.columns
      const shownColumns = view.columns
      var headers = sheetData.sheet_data[0]
      console.log(headers)
      console.log(allColumns)
      let key_col = allColumns.find(column => column._id = sheetData.key)
      let key_index = headers.findIndex(header => header === key_col.name)
      console.log(key_index)
      const init_columns = allColumns.filter(column => shownColumns.includes(column._id))
        .map(obj => ({ ...obj, index: headers.findIndex(header => header === obj.name)}));
      console.log(init_columns)
      setKeyIndex(key_index)
      setFilteredColumns(init_columns)
      setDatasource(sheetData)
    };
    getFilteredColumns();
  }, [view, sheetData])
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
    onClickRecord(record,other)
  }


  if (filteredColumns.length === 0) {
    return <div>Loading views...</div>;
  }
  else{
    console.log(filteredColumns)
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
            {typeof sheetData.sheet_data !== 'undefined' &&  (sheetData.sheet_data).slice(1).map((record) =>(
                <TableRow key={record[keyIndex]} className={classes.tableRow} onClick={() => handleClickRecord(record, record[keyIndex])}>
                  {filteredColumns.map((column) => (
                    <TableCell key={column._id}>{record[column.index] || ''}</TableCell>
                  ))} 
                  </TableRow>
              )
            )
          }
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default TableView;