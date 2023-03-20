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

//Google Api



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
    await AppModel.findById(req.query.id).then((res) => {
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

// GET all apps for a given user
app.get('/api/apps', async (req, res) => {
    const userEmail = req.query.userEmail;

    console.log(userEmail)

    AppModel.find({ creator: userEmail })
      .sort({ _id: -1 })
      .then(apps => res.json(apps))
      .catch(error => res.status(500).json({ error }));
});

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