import React from 'react'
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useNavigate } from 'react-router-dom'
import {Box} from '@mui/material';

function EndUserNavBar(props) {
  console.log(props)
  const tableViews = props.tableViews
  console.log(tableViews)

  const navigate = useNavigate();
  return (
    <Box sx={{ width: 500 }}>
      <BottomNavigation
        showLabels
        //value={value}
        onChange={(event, newValue) => {
          console.log(`/view_${newValue}`)
          navigate(`/end_user_view/${newValue}`)
        }}
      >
        {tableViews.length !== 0 && (  
            tableViews.map((view) => (
                <BottomNavigationAction label ={view.name} value = {view._id} />
            ))
        )}
      </BottomNavigation>
    </Box>
  )
}

export default EndUserNavBar
