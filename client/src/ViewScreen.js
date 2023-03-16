import React from 'react'
import {IconButton, Stack, Button, Typography, AppBar, Card, CardActionArea, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container, dividerClasses} from '@mui/material'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();
function ViewScreen() {
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
  }
    return(
        <main>
            <ThemeProvider theme={theme}>
                <Container>
                    <CssBaseline />
                    <Box sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        }}>
                        <Typography component="h1" variant="h5">
                            Create View
                        </Typography>
                            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }} >
                                    <Grid item xs={12} sm={12}>
                                        <label>Name:</label>
                                        <input id = "name" type="text" value={name} onChange={(event) => setName(event.target.value)} required/>
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <label>View Type:</label>
                                        <select id="viewType" value={viewType} onChange={(event) => setViewType(event.target.value)} required>
                                            <option value="TableView">Table View</option>
                                            <option value="DetailView">Detail View</option>
                                        </select>
                                    </Grid>

                                    {viewType === 'TableView' && (
                                        <>
                                            <Grid item xs={12} sm={12}>
                                                <label>Allow Adding Records:</label>
                                                <input id="addRecord" type="checkbox" checked={addRecord} onChange={(event) => setAddRecord(event.target.checked)} />
                                            </Grid>

                                        </>
                                    )}

                                    {viewType === 'DetailView' && (
                                        <>
                                            <Grid item xs={12} sm={12}>
                                                <label>Allow Editing Records:</label>
                                                <input id="editRecord" type="checkbox" checked={editRecord} onChange={(event) => setEditRecord(event.target.checked)} />
                                            </Grid>
                                            <Grid item xs={12} sm={12}>
                                                <label>Allow Deleting Records:</label>
                                                <input id="deleteRecord" type="checkbox" checked={deleteRecord} onChange={(event) => setDeleteRecord(event.target.checked)} />
                                            </Grid>
                                        </>
                                    )}
                                    <Grid item xs={12} sm={12}>
                                        <label>Roles:</label>
                                        <input id = "roles" type="text" value = {roles} onChange = {(event) => setRoles(event.target.value)} required/>
                                    </Grid>
                                    <Button
                                     type="submit"
                                     fullWidth
                                     variant="contained"
                                     sx={{ mt: 3, mb: 2 }}
                                    >
                                        Save
                                    </Button>
                            </Box> 

                    </Box>
                </Container>
            </ThemeProvider>
        </main>
    )
}
    


export default ViewScreen;