/**
 * BASE FILE FOR APP
 */

//DEPENDENCIES
const express = require('express')
require('dotenv').config()
const { PORT } = process.env;
const path = require('path')
const handler = require('./handler')

//App container 
const app = express();


//configure view
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'))

app.use('/blog', handler)

//start server
app.listen(PORT, () => { console.log(`server is up and listening on port ${PORT}`) })

