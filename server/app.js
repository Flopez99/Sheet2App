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

const getSpreadsheetIdAndSheetIdFromUrl = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit\#gid=([0-9]+)/);
  return match ? { spreadsheetId: match[1], sheetId: match[2] } : null;
};

const isEndUser = async (sheets, spreadsheetId, sheetId, userEmail) => {
  if (!spreadsheetId) return false;

  try {
    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!B2:Z`;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = result.data.values || [];
    for (const row of rows) {
      for (let i in row) {
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
    const endUserAppsPromises = allApps.map(async (app) => {
      const idObject = getSpreadsheetIdAndSheetIdFromUrl(app.role_membership_url);
      if (idObject && idObject.spreadsheetId && idObject.sheetId && (await isEndUser(sheets, idObject.spreadsheetId, idObject.sheetId, userEmail))) {
        return app;
      }
      return null;
    });
    const endUserApps = (await Promise.all(endUserAppsPromises)).filter(app => app !== null);
  
    // Sort the end-user apps by the time they were added into the DB
    endUserApps.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
  
    res.json(endUserApps);
});
 

const isDeveloper = async (sheets, spreadsheetId, sheetId, userEmail) => {
  if (!spreadsheetId) return false;

  try {
    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A:A`;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
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
  const developerAppsPromises = otherApps.map(async (app) => {
    const isObj = getSpreadsheetIdAndSheetIdFromUrl(app.role_membership_url);
    if (isObj && isObj.sheetId && isObj.spreadsheetId && await isDeveloper(sheets, isObj.spreadsheetId, isObj.sheetId, userEmail)) {
      return app;
    }
    return null;
  });
  const developerApps = (await Promise.all(developerAppsPromises)).filter((app) => app !== null);

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

  const idObject = getSpreadsheetIdAndSheetIdFromUrl(role_sheet.role_membership_url);
  const spreadsheetId = idObject.spreadsheetId;
  const sheetId = idObject.sheetId
  if(!(idObject && spreadsheetId && sheetId)){
    console.log('Bad SheetID, and spreadsheetid')
    console.log(spreadsheetId)
    console.log(sheetId)
    return false;
  }

  const auth = new google.auth.GoogleAuth({  
    keyFile: 'credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }); 

  const client = await auth.getClient(); 
  const sheets = google.sheets({ version: 'v4', auth: client });


  let roles = []
  try{
        // Get information about the spreadsheet
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId,
          includeGridData: false,
        });
    
        // Find the sheet with the matching ID
        const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));
    
        if (!sheet) {
          console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
          return false;
        }
    
        // Use the sheet name in the range parameter
        const range = `${sheet.properties.title}!A1:Z1`;
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

  

  const idObject = getSpreadsheetIdAndSheetIdFromUrl(role_sheet.role_membership_url);
  const spreadsheetId = idObject.spreadsheetId;
  const sheetId = idObject.sheetId
  if(!(idObject && spreadsheetId && sheetId)){
    console.log('Bad SheetID, and spreadsheetid')
    console.log(spreadsheetId)
    console.log(sheetId)
    return false;
  }

  const auth = new google.auth.GoogleAuth({  
    keyFile: 'credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }); 

  const client = await auth.getClient(); 
  const sheets = google.sheets({ version: 'v4', auth: client });

  //const range = `A1:Z`; 
  let roles = []
  try{
    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A1:Z`;

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

app.post('/delete_datasource', async (req, res)=> {
  const datasourceId = req.body.datasourceId
  const appId = req.body.appId

  try {
    const app = await AppModel.findById(appId)

    app.data_sources = app.data_sources.filter(d => d !== datasourceId)
 
    await app.save()

    const deletedDataSource = await DataSource.findByIdAndDelete(datasourceId)

    res.status(200).json({
      message: 'Datasource Deleted Successfuly',
      dataSource: deletedDataSource,
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Error deleting datasource',
    });
  }
})



app.post('/delete_view', async (req, res)=> {
  const view = req.body.view
  const viewId = view._id
  const appId = req.body.appId

  try {
    const app = await AppModel.findById(appId)

    app.views = app.views.filter(v => v !== viewId)

    await app.save()

    const deletedView = await ViewModel.findByIdAndDelete(viewId)

    res.status(200).json({
      message: 'View Deleted Successfuly',
      view: deletedView,
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Error deleting view',
    });
  }
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
  DataSource.findOne({ name: req.query.refferenceName, sheet_index: req.query.sheetIndex })
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

    const { sheet_url } = req.query;
    console.log("Hi")
    console.log(req.query)
    console.log(sheet_url);

    const auth = new google.auth.GoogleAuth({
        keyFile:"credentials.json",
        scopes:"https://www.googleapis.com/auth/spreadsheets",
    })
    const client = await auth.getClient();
    const sheets = google.sheets({version:"v4", auth: client})
    //const sheets = google.sheets({version:"v4", auth})

    const idObject = getSpreadsheetIdAndSheetIdFromUrl(sheet_url);
    const spreadsheetId = idObject.spreadsheetId;
    const sheetId = idObject.sheetId
    if(!(idObject && spreadsheetId && sheetId)){
      console.log('Bad SheetID, and spreadsheetid')
      console.log(spreadsheetId)
      console.log(sheetId)
      return false;
    }
    
    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A1:Z1`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
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

    const { sheet_url } = req.query;
    const auth = new google.auth.GoogleAuth({
        keyFile:"credentials.json",
        scopes:"https://www.googleapis.com/auth/spreadsheets",
    })
    const client = await auth.getClient();
    const sheets = google.sheets({version:"v4", auth: client})

    const idObject = getSpreadsheetIdAndSheetIdFromUrl(sheet_url);
    const spreadsheetId = idObject.spreadsheetId;
    const sheetId = idObject.sheetId
    if(!(idObject && spreadsheetId && sheetId)){
      console.log('Bad SheetID, and spreadsheetid')
      console.log(spreadsheetId)
      console.log(sheetId)
      return false;
    }

    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A1:Z`;


    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
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

function compareLists(list1, list2) {
  if (list1.length !== list2.length) {
    // if the lists have different lengths, they are not the same
    return false;
  } 

  for (let i = 0; i < list1.length; i++) {
    if (list1[i] !== list2[i]) {
      // if any element is different, the lists are not the same
      return false;
    }
  }
 
  // if we haven't returned yet, the lists are the same
  return true;
}
function findRowIndex(arr, keyColumn, keyValue) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][keyColumn] === keyValue) {
      return i;
    }
  }
  // return -1 if no row with matching key value was found
  return -1;
}
function isColumnUnique(arr, columnIndex, keyValue, rowIndex) {
  const uniqueValues = new Set();
  uniqueValues.add(keyValue);
  console.log('KEY VALUE!!')
  console.log(keyValue)
  var count = 0;
  for (let row of arr) {
    if(count !== rowIndex){
      const value = row[columnIndex];
      if (uniqueValues.has(value)) {
        console.log("Values: " + value)
        return false; // Not unique
      }
      uniqueValues.add(value);
    }
    count++;
    
  }
  return true; // Unique
}
function determineType(input) {
  if (input === '') {
    return null; // Ignore empty strings
  }
  if (!isNaN(input)) {
    return 'Number';
  }
  if (typeof input === 'string' && /^https?:\/\/\S+$/.test(input)) {
    return 'URL';
  }
  if (typeof input === 'string' && (input.toLowerCase() === 'true' || input.toLowerCase() === 'false')) {
    return 'Boolean';
  }
  return 'Text';
}
function checkTypes(record, typeList) {
  console.log("typeList")
  console.log(typeList)
  for (let i = 0; i < record.length; i++) {
    const attribute = record[i];
    const expectedType = typeList[i];
    const actualType = determineType(attribute);
    if (actualType !== null && expectedType !== "initial_value" && actualType !== expectedType) {
      console.log("record value: " + attribute)
      console.log(actualType)
      console.log(expectedType)
      console.log('Here')
      console.log(record.length)
      console.log(typeList.length)
      return false;
    }
  }
  return true;
}


app.post('/api/edit_record', async (req, res) => {
  const { sheet_url, record, prevHeader, keyIndex, keyValue, typeList  } = req.body;
  console.log("In Edit Record")
  console.log(sheet_url);
  console.log(record)
  console.log(prevHeader)
  console.log(keyIndex)
  console.log(keyValue)
  console.log('TypeList')
  console.log(typeList)


    //gets the sheetdata to find position to edit, saves it in sheet_data
    const auth = new google.auth.GoogleAuth({
      keyFile:"credentials.json",
      scopes:"https://www.googleapis.com/auth/spreadsheets",
  })
  var sheet_data;
  const sheets = google.sheets({version:"v4", auth})

  const idObject = getSpreadsheetIdAndSheetIdFromUrl(sheet_url);
  const spreadsheetId = idObject.spreadsheetId;
  const sheetId = idObject.sheetId
  if(!(idObject && spreadsheetId && sheetId)){
    console.log('Bad SheetID, and spreadsheetid')
    console.log(spreadsheetId)
    console.log(sheetId)
    return false;
  }

    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A1:Z`;

  const sheetHeader = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  })
  .then((response) =>{

    //console.log(response.data)
    if (response.status === 200) {
      sheet_data = response.data.values
    }
    else{
        console.log("In Here")
        return res.status(400).json({ error: 'Error fetching sheet data' });
    } 
  })
  .catch((error) =>{
    console.error('Error fetching sheet data:', error);
    return res.status(500).json({ error: 'Error fetching sheet data' });
  })
  console.log(sheet_data)

  //Once we have sheet data we should compare if headers are the same, if not throw
  //error back
  
  if(!(compareLists(prevHeader, sheet_data[0])))
    return res.json({ success: false, message: "Schema is inconsistent" });

  //getRowIndex
  if(keyIndex < 0)
    return res.json({ success: false, message: "KeyIndex Bad" });


  var rowIndex = findRowIndex(sheet_data, keyIndex, keyValue)

  //checks for key integrity
  if(!(isColumnUnique(sheet_data, keyIndex, record[keyIndex], rowIndex))){
    return res.json({ success: false, message: "Repeated Key, No Key Integrity" });

  }
  //checks for type integrity
  if(!(checkTypes(record, typeList))){
    return res.json({ success: false, message: "Type Error!" });
  }
  //now we can update the row in google sheet with the record info using googleapi
  const range2 = `${sheet.properties.title}!A${rowIndex + 1}`;
  const response =  sheets.spreadsheets.values.update({
    auth,
    spreadsheetId: spreadsheetId,
    range: range2,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [record],
    },
  }, (err, res) => {
    if (err) {
      console.error(err);

      return;
    }
    console.log(`Row updated`);

  });
  res.json({ success: true, message: 'Record edited successfully' });


})
    
  app.post('/addRecord', async (req, res) => {
    const { sheet_url, record, prevHeader, keyIndex, typeList } = req.body;
    console.log(req.body)
    // Logic to store the data in database using the data object
         //gets the sheetdata to find position to edit, saves it in sheet_data
         const auth = new google.auth.GoogleAuth({
          keyFile:"credentials.json",
          scopes:"https://www.googleapis.com/auth/spreadsheets",
      })
      var sheet_data;
      const sheets = google.sheets({version:"v4", auth})

      const idObject = getSpreadsheetIdAndSheetIdFromUrl(sheet_url);
      const spreadsheetId = idObject.spreadsheetId;
      const sheetId = idObject.sheetId
      if(!(idObject && spreadsheetId && sheetId)){
        console.log('Bad SheetID, and spreadsheetid')
        console.log(spreadsheetId)
        console.log(sheetId)
        return false;
      }


    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A1:Z`;

      const sheetHeader = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: spreadsheetId,
        range: range,
      })
      .then((response) =>{
  
        //console.log(response.data)
        if (response.status === 200) {
          sheet_data = response.data.values
        }
        else{
            console.log("In Here")
            return res.status(400).json({ error: 'Error fetching sheet data' });
        } 
      })
      .catch((error) =>{
        console.error('Error fetching sheet data:', error);
        return res.status(500).json({ error: 'Error fetching sheet data' });
      })
      console.log(sheet_data)
      
      //Once we have sheet data we should compare if headers are the same, if not throw
      //error back
      
      if(!(compareLists(prevHeader, sheet_data[0])))
        return res.json({ success: false, message: "Schema is inconsistent" });  
          //checks for key integrity
      if(!(isColumnUnique(sheet_data, keyIndex, record[keyIndex], -1))){
        return res.json({ success: false, message: "Repeated Key, No Key Integrity" });
      }

      //checks for type integrity
      if(!(checkTypes(record, typeList))){
        return res.json({ success: false, message: "Type Error!" });

      }


      //now we can update the row in google sheet with the record info using googleapi
      const range2 = `${sheet.properties.title}!A${sheet_data.length + 1}`;
      const response =  sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: spreadsheetId,
        range: range2,
        valueInputOption: "USER_ENTERED",
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [record],
        },
      }, (err, res) => {
        if (err) {
          console.error(err);
  
          return;
        }
        console.log(`Row updated`);
  
      });  
    res.json({ success: true, message: 'Record added successfully' });
  });

  app.post('/api/delete_record', async (req, res) => {
    const { sheet_url, record, prevHeader, keyIndex, keyValue } = req.body;
  
    console.log("DELETING RECORDD")
    console.log(prevHeader)
    console.log(keyIndex)
    console.log(keyValue)  

    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    var sheet_data;
    const sheets = google.sheets({ version: "v4", auth });

    const idObject = getSpreadsheetIdAndSheetIdFromUrl(sheet_url);
    const spreadsheetId = idObject.spreadsheetId;
    const sheetId = idObject.sheetId
    if(!(idObject && spreadsheetId && sheetId)){
      console.log('Bad SheetID, and spreadsheetid')
      console.log(spreadsheetId)
      console.log(sheetId)
      return false;
    }

    // Get information about the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Find the sheet with the matching ID
    const sheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === parseInt(sheetId));

    if (!sheet) {
      console.error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
      return false;
    }

    // Use the sheet name in the range parameter
    const range = `${sheet.properties.title}!A1:Z`;


    const sheetHeader = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: spreadsheetId,
      range: range,
    });
  
    if (sheetHeader.status === 200) {
      sheet_data = sheetHeader.data.values;
    } else {
      console.log("In Here");
      return res.status(400).json({ error: "Error fetching sheet data" });
    }
  
    console.log(sheet_data);
  
    if (!compareLists(prevHeader, sheet_data[0])) {
      return res.json({ success: false, message: "Schema is inconsistent" });

    }
  
    if (keyIndex < 0) {
      return res.json({ success: false, message: "KeyIndex Bad" });
    }
  
    var rowIndex = findRowIndex(sheet_data, keyIndex, keyValue);
  
    // Now we can delete the row in the Google Sheet using the Google API


    const response = await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          { 
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  
    console.log("Row deleted");
    res.json({ success: true, message: "Record deleted successfully" });
  });
  