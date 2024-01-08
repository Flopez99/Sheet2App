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

function UserAppsList({ userEmail, endUser }) {
  const classes = useStyles();
  const [userApps, setUserApps] = useState([]);
  const navigate = useNavigate();

  const endPoint = endUser
    ? 'http://localhost:8080/api/apps-enduser'
    : 'http://localhost:8080/api/apps';

  useEffect(() => {
    axios.get(endPoint, { params: { userEmail } })
      .then(response => {
        console.log(response.data)
        setUserApps(response.data);
      })
      .catch(error =>{
        console.error(error)
        console.log("HELLLOOOO")
      })
  }, [userEmail, endPoint]);

  const handleEditApp = (appId) => {
    // Handle the click event to edit the app
    // You can pass the app ID to the editApp component as a prop
    
    if(endUser){
      //will make a route to show app for endusers
      navigate("/end_user_app", {state: appId})

    }else{
      navigate("/editapp", {state: appId})
    }

  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>App Name</TableCell>
            <TableCell>Creator</TableCell>
            <TableCell>Published</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userApps.map((app) => (
            <TableRow key={app._id} className={classes.tableRow} onClick={() => handleEditApp(app._id)}>
              <TableCell component="th" scope="row">{app.app_name}</TableCell>
              <TableCell component="th" scope="row">{app.creator}</TableCell>
              <TableCell component="th" scope="row">{app.published ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserAppsList;