/**
 * BASE FILE FOR APP
 */

//DEPENDENCIES
const express = require('express')
require('dotenv').config()
const { PORT, SESSION_SCRET } = process.env;
const path = require('path')
const handler = require('./lib/handler')
const sessions = require('./lib/session')
const logs = require('./lib/logs')

//App container 
const app = express();
const session = require('express-session')


//configure view
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'public/views'))

//set up express session middleware
app.use(session({
    secret: SESSION_SCRET,
    resave: false,
    saveUninitialized: true
}))




// routes
app.use('/session/', sessions)
app.use('/post/', handler)


//start server
app.listen(PORT, () => { console.log(`server is up and listening on port ${PORT}`) })

//start log background workers
logs.main();
