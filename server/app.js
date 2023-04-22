//import modules
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const  { google } = require('googleapis');
const AppModel = require("./models/appschema"); 
const ViewModel = require("./models/ViewSchema");
const DataSource = require("./models/DataSourceSchema")
const Column = require("./models/ColumnSchema")
require("dotenv").config();
const fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const credential = require('./credentials.json');


//app
const app = express();
app.use(cors());


mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(() => console.log("DB CONNECTED"))
    .catch((err)=> console.log("DB CONNECTION ERROR", err))


//db
app.use(morgan("dev"))
app.use(cors({origin: true, credentials:true}));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


// Gets the spreadsheet ID from the role_membership_url
const getSpreadsheetIdFromUrl = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
};

// Checks if the provided email is included under any role other than the developer
const isEndUser = async (sheets, spreadsheetId, userEmail) => {
    if (!spreadsheetId) return false;
  
    try {

        // Create the range to include all cells under every column except the first one
        const range = `Sheet1!B2:Z`;

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = result.data.values || [];
        for (const row of rows) {
          for(let i in row){
            if (row[i] && row[i].toLowerCase() === userEmail.toLowerCase()) {
              return true;
            }
          }
        }
    } catch (error) {
      console.error(`Error accessing the sheet: ${error}`);
    }
  
    return false; 
  };

  // GET all apps for a given end-user
  app.get('/api/apps-enduser', async (req, res) => {
    const userEmail = req.query.userEmail;
  
    // Load the stored credentials and create the Google Sheets API client
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
  
    // Query all apps and check if the user is included under any role other than the developer in the role-membership sheet
    const allApps = await AppModel.find({published:true}).sort({ _id: -1 }).exec();
  
    // Concurrently check if the user is an end-user in multiple apps
    const endUserAppsPromises = allApps.map(async app => {
      const spreadsheetId = getSpreadsheetIdFromUrl(app.role_membership_url);
      if (spreadsheetId && await isEndUser(sheets, spreadsheetId, userEmail)) {
        return app;
      }
      return null;
    });
    const endUserApps = (await Promise.all(endUserAppsPromises)).filter(app => app !== null);
  
    // Sort the end-user apps by the time they were added into the DB
    endUserApps.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
  
    res.json(endUserApps);
});
 

// Checks if the provided email is included under the developer role
const isDeveloper = async (sheets, spreadsheetId, userEmail) => {
    if (!spreadsheetId) return false;
  
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:A',
      });
  
      const rows = result.data.values || [];
      for (const row of rows) {
        if (row[0] && row[0].toLowerCase() === userEmail.toLowerCase()) {
          return true;
        }
      }
    } catch (error) {
      console.error(`Error accessing the sheet: ${error}`);
    }
  
    return false;
  };
  
  // GET all apps for a given user
  app.get('/api/apps', async (req, res) => {
    const userEmail = req.query.userEmail;
  
    // Load the stored credentials and create the Google Sheets API client
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
  
    const sheets = google.sheets({ version: 'v4', auth: client });
  
    // Get all apps where the user is listed under the "creator" field
    const creatorApps = await AppModel.find({ creator: userEmail }).sort({ _id: -1 }).exec();
  
    // Query all apps where the user is not the creator and check if the user is included under the developer role in the role-membership sheet
    const otherApps = await AppModel.find({ creator: { $ne: userEmail } }).sort({ _id: -1 }).exec();
    
    // Concurrently check if the user is a developer in multiple apps
    const developerAppsPromises = otherApps.map(async app => {
      const spreadsheetId = getSpreadsheetIdFromUrl(app.role_membership_url);
      if (spreadsheetId && await isDeveloper(sheets, spreadsheetId, userEmail)) {
        return app;
      }
      return null;
    });
    const developerApps = (await Promise.all(developerAppsPromises)).filter(app => app !== null);
  
    // Combine the apps where the user is the creator and the apps where the user is a developer
    const combinedAppsSet = [...new Set([...creatorApps, ...developerApps])];
    const combinedApps = Array.from(combinedAppsSet);
  
    // Sort the combined apps by the time they were added into the DB
    combinedApps.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
  
    res.json(combinedApps);
  });



//middleware
 

//Get roles from an app's role-membership-sheet
app.get('/roles', async (req, res) => {
  const appId = req.query.appId; 
  const role_sheet = await AppModel.findById(appId)

  
  const spreadsheetId = getSpreadsheetIdFromUrl(role_sheet.role_membership_url);
  const auth = new google.auth.GoogleAuth({  
    keyFile: 'credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }); 

  const client = await auth.getClient(); 
  const sheets = google.sheets({ version: 'v4', auth: client });

  const range = `A1:Z1`; 

  let roles = []
  try{
    const result = await sheets.spreadsheets.values.get({ 
        spreadsheetId,
        range, 
    });
    console.log('in roles')
    console.log(result.data.values)
    roles = result.data.values[0];

  }catch(error){

    console.log("Error Accessing Role Membership Sheet: " + error)
 
  }
 
  res.send({ roles });
})

app.get('/roles_user', async (req, res) => {
  const appId = req.query.appId; 
  const user = req.query.userEmail
  console.log(user)
  const role_sheet = await AppModel.findById(appId)

  
  const spreadsheetId = getSpreadsheetIdFromUrl(role_sheet.role_membership_url);
  const auth = new google.auth.GoogleAuth({  
    keyFile: 'credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }); 

  const client = await auth.getClient(); 
  const sheets = google.sheets({ version: 'v4', auth: client });

  const range = `A1:Z`; 
  let roles = []
  try{
    const result = await sheets.spreadsheets.values.get({ 
        spreadsheetId,
        range, 
    });
    console.log('in roles')
    console.log(result.data.values)
    const sheet_data = result.data.values
    for (let j = 0; j < sheet_data[0].length; j++) {
      for (let i = 0; i < sheet_data.length; i++) {
        if (sheet_data[i][j] === user) {
          console.log('240')
          console.log(sheet_data[0][j])
          roles.push(sheet_data[0][j]);
          // Break out of the inner loop once a match is found in this column
          break;
        }
      }
    }
  

  }catch(error){

    console.log("Error Accessing Role Membership Sheet: " + error)
 
  }
  res.send({ roles });
})


app.post('/edit_view', async (req, res) => {
  const viewId = req.body.viewId;
  const viewData = req.body.view; 

  ViewModel.findByIdAndUpdate(viewId, viewData)
    .then((instance) => {
      res.status(200).json({
        message: 'View updated successfully',
        view: instance,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: 'Error updating view',
      });
    });
});



app.post('/create_view', async (req,res) =>{
  console.log("Creating view") 
  console.log(req.body.view)
  ViewModel.create(req.body.view)
  .then(async (instance) => {
    console.log(instance)
    const testapp = await AppModel.findByIdAndUpdate(req.body.appId, {$push : {views: instance._id}})
    res.status(200).json({
      message: 'View Created successfully',
      view_create:instance
    });

  })
  .catch((err) =>{
    console.log(err)
    res.status(500).json({
      error: 'Error Creating View',
    });
  })
})



app.post('/app', async (req,res) =>{
    console.log("Hi")
    console.log(req.body)
    AppModel.create(req.body)
    .then((instance) => {
        console.log("good")
        res.send(instance)
    })
    .catch((err) =>{
        console.log("bad")
        res.send(err);
    })
})

app.get('/app', async (req, res) =>{
    var app_data;
    console.log("Getting Id")
    console.log(req.query.id)
    await AppModel.findById(req.query.id).populate('data_sources')
    .populate({
      path: 'views',
      populate: {
        path: 'table',
        populate: {
          path: 'columns'
        }
      }
    })
    .then((res) => {
        app_data = res
        console.log("Good1")
    })
    .catch((err) => console.log(err))
    console.log(app_data)
    res.send(app_data)

})

app.post('/datasource', async (req, res) => {
    console.log(req.body)
    DataSource.create(req.body)
    .then((instance) => {
        console.log("good")
        res.send(instance)
    })
    .catch((err) =>{
        console.log("bad Datasource")
        console.log(err)
        res.send(err);
    }) 
})  
 
app.get('/datasource', async (req, res) => {
    var datasource_data; 
    await DataSource.findById(req.query.id)
    .populate({
      path: 'columns',
      populate: {
        path: 'references'
      }
    })
    .then((res) => {
        datasource_data = res
        console.log("Good1")
    })
    .catch((err) => console.log(err))
    console.log(datasource_data)
    res.send(datasource_data)

})

app.post('/column', async (req,res) => {
    console.log("Here")
    console.log(req.body)
    var new_column = req.body
    if(new_column.references === "")
      new_column.references = null 
    Column.create(new_column)
    .then((instance) => {
        console.log("good")
        res.send(instance)
    })
    .catch((err) =>{
        console.log('bad')
        console.log(err)
        res.send(err);
    })
})
app.post('/delete_column', async (req, res) => {
  console.log("In Deletion")
  const columnId = req.body.columnId

  // Remove the column from all views
  try {
    await ViewModel.updateMany(
      {
        $or: [
          { columns: columnId },
          { filter: columnId },
          { user_filter: columnId },
          { editable_columns: columnId }
        ]
      },
      {
        $pull: {
          columns: columnId,
          filter: columnId,
          user_filter: columnId,
          editable_columns: columnId
        }
      }
    );
    await DataSource.updateMany(
      { columns: columnId },
      { $pull: { columns: columnId } }
    );
    await Column.deleteOne({ _id: columnId });

    console.log('References to the column have been removed from all views');
  } catch (error) {
    console.log("In Error")
    console.error(error);
  }
  res.send("good")


})
app.get('/datasource_list', async (req, res) => {
    const appId = req.query.appId;
    const app_datasources = await AppModel.findById(appId).populate('data_sources')

    console.log(app_datasources)
    res.send(app_datasources)
})

app.get('/datasource_list1', async (req, res) => {
    const appId = req.query.appId;
    const app_datasources = await AppModel.findById(appId).populate('data_sources')
    
    res.send(app_datasources.data_sources)
})

app.post('/deleteApp', async (req, res) => {
  const id = req.body.id;

  try {
    const app = await AppModel.findByIdAndDelete(id);

    res.status(200).json({
      message: 'App deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.post('/app_datasource', async (req, res) => {
    let appId = req.body.appId;
    let datasourceId = req.body.datasourceId
    console.log(req.body)
    const testapp = await AppModel.findByIdAndUpdate(appId, {$push : {data_sources: datasourceId}})
    console.log("Hello")
    console.log(testapp)
    res.send('done')
})
app.post('/updateColumn', async (req,res) =>{
    let columnId = req.body.columnId
    let column_data = req.body.column_data
    console.log(column_data)
    let columntest = await Column.findByIdAndUpdate(columnId, column_data)
    console.log('after upadte')
    console.log(columntest)
    res.send('done')
})
app.post('/updateDatasource', async (req, res) =>{
    let datasourceId = req.body.datasourceId
    let columns = req.body.columns
    let name = req.body.name
    let key = req.body.key
    let result = DataSource.findById(datasourceId)
    await DataSource.updateOne({_id: datasourceId}, {$push : {columns : {$each : columns}}} )
    await DataSource.findByIdAndUpdate(datasourceId, {name: name})
    await DataSource.findByIdAndUpdate(datasourceId, {key: key})
    res.send("done")
})

app.get('/datasource_url' , async (req, res) => {
  console.log('in datasource_url')
  console.log(req.query)
  DataSource.findOne({ url: req.query.url, sheet_index: req.query.sheetIndex })
  .then(dataSource => {
    res.send(dataSource)
    if (dataSource) {
      console.log(`Data source with URL  and sheet index  already exists.`);
      res.send(dataSource)
    } else {
      console.log(`Data source with URL  and sheet index  does not exist yet.`);
      res.send('')
      // Create a new data source document and save it to the database if it does not exist yet
    }
  })
  .catch(err => console.error(err));
})
//Cross checks email with the global developers list
app.get('/api/check-email', async (req, res) =>{
    const email = req.query.email;
    const sheetId = '1cn8iTJUjSuKK3qda5-EiGLLQUIXhX9jonsVsampczkM';
    const range = 'A:A';
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: client});
    const sheetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range
    });
    const sheetData = sheetResponse.data.values;
    const isDeveloper = sheetData.some(row => row[0] === email);
    res.send({isDeveloper});
});

app.post('/updateApp', async(req, res) =>{
  const { id, app_name, role_membership_url, published } = req.body;

  try {
    const updateResult = await AppModel.updateOne(
      { _id: id },
      {
        $set: {
          app_name: app_name,
          role_membership_url: role_membership_url,
          published: published,
        },
      }
    ); 

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({ message: "App updated successfully" });
    } else {
      res.status(404).json({ message: "App not found" });
    }
  } catch (error) {
    console.error("Error updating app:", error);
    res.status(500).json({ message: "Error updating app" });
  }
})


//routes
const testRoutes = require('./routes/test.js')
app.use("/", testRoutes)
 
//port
const port = process.env.PORT || 8080;

//listener 
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


// Googlesheet Data

app.get('/api/fetchSheetData', async (req, res) => {

    const { sheetId, sheetIndex } = req.query;
    console.log("Hi")
    console.log(sheetId);
    console.log(sheetIndex);
    const auth = new google.auth.GoogleAuth({
        keyFile:"credentials.json",
        scopes:"https://www.googleapis.com/auth/spreadsheets",
    })

    const sheets = google.sheets({version:"v4", auth})

    const response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: sheetId,
        range: `Sheet${sheetIndex}!A1:Z1`,
      })
      .then((response) =>{
        console.log(response.data)
        if (response.status === 200) {
            res.send(response.data);
        } else {
            console.log("In Here")
            res.status(400).json({ error: 'Error fetching sheet data' });
        } 
      })
      .catch((error) =>{
        console.error('Error fetching sheet data:', error);
        res.status(500).json({ error: 'Error fetching sheet data' });
      })

  });

  app.get('/records', async (req, res) => {

    const { sheetId, sheetIndex } = req.query;
    console.log("Hi")
    console.log(sheetId);
    console.log(sheetIndex);
    const auth = new google.auth.GoogleAuth({
        keyFile:"credentials.json",
        scopes:"https://www.googleapis.com/auth/spreadsheets",
    })

    const sheets = google.sheets({version:"v4", auth})

    const response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: sheetId,
        range: `Sheet${sheetIndex}!A1:Z`,
      })
      .then((response) =>{
        console.log(response.data)
        if (response.status === 200) {
            res.send(response.data);
        } else {
            console.log("In Here")
            res.status(400).json({ error: 'Error fetching sheet data' });
        } 
      })
      .catch((error) =>{
        console.error('Error fetching sheet data:', error);
        res.status(500).json({ error: 'Error fetching sheet data' });
      })

  });

  app.post('/addRecord', async (req, res) => {
    const { data } = req.body;
    // Logic to store the data in database using the data object

    res.json({ success: true, message: 'Record added successfully' });
  });
  