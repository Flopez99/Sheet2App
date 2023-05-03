import React from 'react'
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
    tableRow: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f5f5f5',
      },
      '&:hover': {
        cursor: 'pointer',
        backgroundColor: '#e5e5e5',
      },
    },
  });

function DataSourceList({datasources, actual_appId}) {
console.log(datasources)
const classes = useStyles();
const navigate = useNavigate();
const handleEditApp = (datasourceid) => {
    // Handle the click event to edit the app
    // You can pass the app ID to the editApp component as a prop
    
    console.log('gottem')
    navigate('/editdatasource', {state: {datasourceId: datasourceid, appId: actual_appId }}) //passing datasource id

  };
  return (
    <TableContainer component={Paper}>
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Datasource Name</TableCell>
          <TableCell>URL</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {datasources.map((app) => (
          <TableRow key={app._id} className={classes.tableRow} onClick={() => handleEditApp(app._id)}>
            <TableCell component="th" scope="row">{app.name}</TableCell>
            <TableCell component="th" scope="row">{app.url}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  )
}

export default React.memo(DataSourceList);