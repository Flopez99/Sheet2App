//import modules
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const AppModel = require("./models/appschema");
require("dotenv").config();

 
//app
const app = express();


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
