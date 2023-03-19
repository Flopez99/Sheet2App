import React, {useState} from 'react';
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Card,
  Grid,
  Toolbar,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

function CreateView() {
  const [name, setName] = useState('');
    // const [table, setTable] = useState('');
    // const [columns, setColumns] = useState([]);
    const [viewType, setViewType] = useState('TableView'); //TableView or DetailView
    const [addRecord, setAddRecord] = useState(false);
    const [editRecord, setEditRecord] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(false);
    const [roles, setRoles] = useState([]);
    // const [filter, setFilter] = useState('');
    // const [userFilter, setUserFilter] = useState('');
    // const [editFilter, setEditFilter] = useState('');
    // const [editableColumns, setEditableColumns] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Create a view model based on the input values
    const viewModel = {
      name: name,
      view_type: viewType,
      add_record: addRecord,
      edit_record: editRecord,
      delete_record: deleteRecord,
      roles: roles,
    };
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Create View
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  id="viewType"
                  label="View Type"
                  value={viewType}
                  onChange={(event) => setViewType(event.target.value)}
                >
                  <MenuItem value="TableView">Table View</MenuItem>
                  <MenuItem value="DetailView">Detail View</MenuItem>
                </TextField>
              </Grid>
              {viewType === 'TableView' && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={addRecord}
                        onChange={(event) => setAddRecord(event.target.checked)}
                      />
                    }
                    label="Allow Adding Records"
                  />
                </Grid>
              )}
              {viewType === 'DetailView' && (
                <>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editRecord}
                          onChange={(event) => setEditRecord(event.target.checked)}
                        />
                      }
                      label="Allow Editing Records"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteRecord}
                          onChange={(event) => setDeleteRecord(event.target.checked)}
                        />
                      }
                      label="Allow Deleting Records"
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  name="roles"
                  required
                  fullWidth
                  id="roles"
                  label="Roles"
                  value={roles}
                  onChange={(event) => setRoles(event.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>
               Save
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
    );
    }

export default CreateView;


