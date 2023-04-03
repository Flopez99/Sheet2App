import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import TableView from './TableView';

const theme = createTheme(() => ({
    root: {
    flexGrow: 1,
  },
  appBar: {
    marginBottom: 2,
  },
  title: {
    flexGrow: 1,
  },
}));

function DisplayApp(props) {
  const [app, setApp] = useState({})
  const [views, setViews] = useState([]);
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const classes = theme;

  useEffect(() => {
    const getApp = async () => {
      try {
        const res = await axios.get("http://localhost:8080/app", { params: { id: props.appId } });
        console.log("Got App");
        console.log(res.data);
        setApp(res.data);
        setViews(res.data.views);

      } catch (error) {
        console.error(error);
      }
    };
    getApp();
  }, [props.appId]);

  if (views.length === 0) {
    return <div>Loading views...</div>;
  }

  const activeView = views[activeViewIndex];

  const handleChangeView = (index) => {
    setActiveViewIndex(index);
  };

  return (
    <ThemeProvider theme={theme}>
        <div>
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
            {views.map((view, index) => (
                <Button key={view._id} color="inherit" onClick={() => handleChangeView(index)}>
                {view.name}
                </Button>
            ))}
            </Toolbar>
        </AppBar>
        <div className={classes.root}>
            <Typography variant="h3" className={classes.title}>
            </Typography>
            <TableView view={activeView} />
        </div>
        </div>
    </ThemeProvider>
  );
}

export default DisplayApp;