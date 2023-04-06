import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Stack, Container, Grid, Button, Box } from '@mui/material';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
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
    // NEED TO CREATE ADD_RECORD COMPONENT 
    // so that it redirects to a pop up or different page
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
    </Stack>
  );  
}

export default TableView;



// import React, { useEffect, useState} from 'react';
// import { makeStyles } from '@mui/styles';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Stack } from '@mui/material';
// import { Container } from '@mui/system';

// // const useStyles = makeStyles({
// //   table: {
// //     minWidth: 650,
// //   },
// // });
// const useStyles = makeStyles({
//   table: {
//     minWidth: 650,
//   },
//   header: {
//     backgroundColor: 'rgba(0, 0, 0, 0.05)',
//     fontWeight: 'bold',
//   },
// });

// function TableView({ view, sheetData, onClickRecord }) {
//   console.log(sheetData)
//   const [filteredColumns, setFilteredColumns] = useState([])
//   const [datasource, setDatasource] = useState({})
//   const [keyIndex, setKeyIndex] = useState(0)

//   useEffect(() => {
//     const getFilteredColumns = async () => { 
//       console.log('IN GETFITERED COLUMNS')
//       const allColumns = view.table.columns
//       const shownColumns = view.columns
//       var headers = sheetData.sheet_data[0]
//       console.log(headers)
//       console.log(allColumns)
//       let key_col = allColumns.find(column => column._id = sheetData.key)
//       let key_index = headers.findIndex(header => header === key_col.name)
//       console.log(key_index)
//       const init_columns = allColumns.filter(column => shownColumns.includes(column._id))
//         .map(obj => ({ ...obj, index: headers.findIndex(header => header === obj.name)}));
//       console.log(init_columns)
//       setKeyIndex(key_index)
//       setFilteredColumns(init_columns)
//       setDatasource(sheetData)
//     };
//     getFilteredColumns();
//   }, [view, sheetData])
//   // useEffect(() => {
//   //   const getSheetData = async () => {
//   //     setDatasource(sheetData)
//   //   };
//   //   getSheetData();
//   // }, [sheetData])
//   //console.log(Object.keys(sheetData).length)
//   const classes = useStyles();
//   //const header = sheetData[0]
//   // const allColumns = view.table.columns
//   // const shownColumns = view.columns
//   //const filteredColumns = allColumns.filter(column => shownColumns.includes(column._id));//.map(obj => ({ ...obj, index: header.findIndex(obj.name)}));
//   // console.log(filteredColumns)

//   const handleClickRecord = (record, other) => {
//     onClickRecord(record,other)
//   }


//   if (filteredColumns.length === 0) {
//     return <div>Loading views...</div>;
//   }
//   else{
//     console.log(filteredColumns)
//   }
//   return (
//     <Stack spacing={2} >
//       <Typography variant="h4" component="h2">
//         {view.name}
//       </Typography>
//       <Typography>
//       <Container>
//       <TableContainer component={Paper} elevation = {4} >
//         <Table className={classes.table} aria-label="simple table">
//           <TableHead>
//             <TableRow>
//               {filteredColumns.map((column) => (
//                 <TableCell key={column._id} className={classes.header}>
//                   {column.name}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {typeof sheetData.sheet_data !== 'undefined' &&
//               sheetData.sheet_data.slice(1).map((record) => (
//                 <TableRow
//                   key={record[keyIndex]}
//                   className={classes.tableRow}
//                   onClick={() => handleClickRecord(record, record[keyIndex])}
//                 >
//                   {filteredColumns.map((column) => (
//                     <TableCell key={column._id}>{record[column.index] || ''}</TableCell>
//                   ))}
//                 </TableRow>
//               ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       </Container>
//       </Typography>
//     </Stack>
//   );
// }

// export default TableView;