/**
 * BASE FILE FOR APP
 */

//DEPENDENCIES
const express = require('express')
require('dotenv').config()
const { PORT } = process.env;
const path = require('path')
const handler = require('./handler')
const session = require('./session')
const token  = require('./token')
//App container 
const app = express();


//configure view
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'))

// routes
app.use('/session/', session)
app.use('/blog/', handler)
app.use('/token',token)

//start server
app.listen(PORT, () => { console.log(`server is up and listening on port ${PORT}`) })

