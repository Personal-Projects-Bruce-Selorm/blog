/**
 * BASE FILE FOR APP
 */

//DEPENDENCIES
const express = require('express')
require('dotenv').config()
const { PORT } = process.env;
const path = require('path')
const handler = require('./lib/handler')
const session = require('./lib/session')
const token = require('./lib/token')
//App container 
const app = express();


//configure view
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'public/views'))

// routes
app.use('/session/', session)
app.use('/blog/', handler)
app.use('/token', token)

//start server
app.listen(PORT, () => { console.log(`server is up and listening on port ${PORT}`) })

