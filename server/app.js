//import modules
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const  { google } = require('googleapis');
const AppModel = require("./models/appschema");
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
    await AppModel.findById(req.query.id).populate('data_sources').then((res) => {
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
        console.log("bad")
        res.send(err);
    })
})

app.get('/datasource', async (req, res) => {
    var datasource_data;
    await DataSource.findById(req.query.id).populate('columns').then((res) => {
        datasource_data = res
        console.log("Good1")
    })
    .catch((err) => console.log(err))
    console.log(datasource_data)
    res.send(datasource_data)

})

app.post('/column', async (req,res) => {
    console.log(req.body)
    Column.create(req.body)
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

app.get('/datasource_list', async (req, res) => {
    const appId = req.query.appId;
    const app_datasources = await AppModel.findById(appId).populate('data_sources')
    console.log(app_datasources)
    res.send(app_datasources)
})
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
    let columntest = await Column.findByIdAndUpdate(columnId, column_data)
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

// GET all apps for a given user
app.get('/api/apps1', async (req, res) => {
    const userEmail = req.query.userEmail;


    AppModel.find({ creator: userEmail })
      .sort({ _id: -1 })
      .then(apps => res.json(apps))
      .catch(error => res.status(500).json({ error }));
});



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


app.get('/testing', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile:"credentials.json",
        scopes:"https://www.googleapis.com/auth/spreadsheets",
    })

    //Create client instance for auth
    const client = await auth.getClient();

    //Instance of Google Sheets API
    const googleSheets = google.sheets({version:"v4", auth:client})

    const spreadsheetId = "1cn8iTJUjSuKK3qda5-EiGLLQUIXhX9jonsVsampczkM";

    //Get Spreadsheet metadata
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    })

    //Read the rows
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range:"Sheet1!A:A",
    })


    res.send(getRows.data)
});




//routes
const testRoutes = require('./routes/test.js')
app.use("/", testRoutes)
 
//port
const port = process.env.PORT || 8080;

//listener 
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

// app.get("/insert", (req, res) =>{
//     var newAppModel = new AppModel({
//         app_name: "First App",
//         creator: "Deez",
//         published: false,
//         role_membership_url: "amazon.com"
//     });
//     newAppModel.save((err, data) =>{
//         if(err)
//             console.error(err)
//         else
//             res.status(200).send({"msg": "Inserted to DB"});
//     }) 
// })
  


// Googlesheet Data


app.get('/api/fetchSheetData', async (req, res) => {
    // const email = req.query.email;
    // const sheetId = '1cn8iTJUjSuKK3qda5-EiGLLQUIXhX9jonsVsampczkM';
    // const range = 'A:A';
    // const auth = new google.auth.GoogleAuth({
    //     keyFile: 'credentials.json',
    //     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    // });
    // const client = await auth.getClient();
    // const sheets = google.sheets({version: 'v4', auth: client});
    // const sheetResponse = await sheets.spreadsheets.values.get({
    //     spreadsheetId: sheetId,
    //     range: range
    // });
    // const sheetData = sheetResponse.data.values;
    // const isDeveloper = sheetData.some(row => row[0] === email);
    // res.send({isDeveloper});


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

    // try {
    //   const response = await sheets.spreadsheets.values.get({
    //     auth,
    //     spreadsheetId: sheetId,
    //     range: `Sheet${sheetIndex}!A:A`,
    //   });

    
    //   if (response.status === 200) {
    //     res.send(response.data);
    
    //   } else {
    //     res.status(400).json({ error: 'Error fetching sheet data' });
    //   }
    // } catch (error) {
    //   console.error('Error fetching sheet data:', error);
    //   res.status(500).json({ error: 'Error fetching sheet data' });
    // }

    
    
    
    
    
    
    
    // const auth = await authorize();
    // const sheets = google.sheets({ version: 'v4', auth });

    // const auth = new google.auth.GoogleAuth({
    //     keyFile:"credentials.json",
    //     scopes:"https://www.googleapis.com/auth/spreadsheets",
    // })

    // const sheets = google.sheets({version:"v4", auth})


    // try {
    //   const response = await sheets.spreadsheets.values.get({
    //     auth,
    //     spreadsheetId: sheetId,
    //     range: `${sheetIndex}!A1:Z`,
    //   });

    
    //   if (response.status === 200) {
    //     res.send(response.data);
    
    //   } else {
    //     res.status(400).json({ error: 'Error fetching sheet data' });
    //   }
    // } catch (error) {
    //   console.error('Error fetching sheet data:', error);
    //   res.status(500).json({ error: 'Error fetching sheet data' });
    // }
  });
  
  app.listen(3001, () => {
    console.log('Server listening on port 3001');
  });
  
//   async function authorize() {
//     const keyFileContent = fs.readFileSync('server/credentials.json', 'utf-8');
//     const key = JSON.parse(keyFileContent);
  
//     const jwtClient = new google.auth.JWT(
//       key.client_email,
//       null,
//       key.private_key,
//       ['https://www.googleapis.com/auth/spreadsheets'],
//       null
//     );
  
//     await jwtClient.authorize();
//     return jwtClient;
//   }