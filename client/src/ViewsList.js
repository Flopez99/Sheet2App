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

function ViewsList(views) {
    console.log(views)
    const my_views = views.views //not sure why i had to do this but this worked?
    const classes = useStyles();
    const navigate = useNavigate();
    const handleEditApp = (view) => {
        // Handle the click event to edit the app
        // You can pass the app ID to the editApp component as a prop
        
        console.log('gottem')
       navigate('/editview', {state: {view: view}}) //passing datasource id

    };
  return (
    <TableContainer component={Paper}>
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>View Name</TableCell>
          <TableCell>View Type</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {my_views.map((view) => (
          <TableRow key={view._id} className={classes.tableRow} onClick={() => handleEditApp(view)}>
            <TableCell component="th" scope="row">{view.name}</TableCell>
            <TableCell component="th" scope="row">{view.view_type}</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  )
}

export default ViewsList
