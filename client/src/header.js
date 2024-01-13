import React from 'react';
import {IconButton, Button, Typography, Toolbar} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
function Headers(props){
    return(
        <React.Fragment>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Button size="small">Subscribe</Button>
          <Typography
            component="h2"
            variant="h5"
            color="inherit"
            align="center"
            noWrap
            sx={{ flex: 1 }}
          >
            Sheet2App
          </Typography>
          <IconButton>
            <SearchIcon />
          </IconButton>
          <Button variant="outlined" size="small">
            Login
          </Button>
        </Toolbar>
        <Toolbar
          component="nav"
          variant="dense"
          sx={{ justifyContent: 'space-between', overflowX: 'auto' }}
        >
        </Toolbar>
      </React.Fragment>
    );
}

export default Headers;