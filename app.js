/**
 * BASE FILE FOR APP
 */

//DEPENDENCIES
const express = require('express')
require('dotenv').config()
const { PORT } = process.env;
const path = require('path')
const db = require('./db_connection');

//App container 
const app = express();


//configure view
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'))

//sample  data
const collectionName ='post';
const collection_verb ='hello';
const data  = {
    title:"test title",
    body:"hello test body",
    author:"Bruce Jay",
    created_on:new Date()
}

db.main(data,collectionName,collection_verb);





//start server
app.listen(PORT, () => { console.log(`server is up and listening on port ${PORT}`) })

