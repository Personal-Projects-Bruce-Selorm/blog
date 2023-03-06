/**
 * base file for db conneection and dbbase definations
 */

//depeendencies
const { MongoClient } = require('mongodb');
require('dotenv').config()
const { CONNEECTION_STRING, DB_NAME, COLLECTION_NAME, INDEX_NAME } = process.env;
const util = require('./utils')



// db container 
var db = {};

//db setup

const cleint = new MongoClient(CONNEECTION_STRING)
const db_name = DB_NAME;
const collection_name = COLLECTION_NAME;
const index_name = INDEX_NAME



//connect to Atlas Cluster
const connectToAtlasCluster = async () => {
    try {
        await cleint.connect();
        console.log('connected to atlas')
    } catch (err) {
        console.log(err)

    }
}


util.checkIfIndexExist(db_name, collection_name, index_name, cleint, function (indexExistStatus) {
    console.log(indexExistStatus)
});

/**
 * @param data
 * @param collection_verb
 */

db.send = function (data, collection_name,collection_verb, callback) {
   

    var verb = typeof collection_verb == 'string' && ['insertOne', 'insertMany', 'findOne', 'find', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany','aggregate'].indexOf(collection_verb) > -1 ? collection_verb.trim() : false;
   
   
    if (verb) {
        const send = async () => {
            try {
                await connectToAtlasCluster();
               var promise =   util.queryGenerator(cleint, db_name, collection_name, collection_verb, data);
                console.log('successful')
                callback(true,   await promise)
            } catch (err) {
                console.error(err)
                callback(false,promise)
            } finally {
                await cleint.close();
            }
        }
        send()

    } else {
        console.log('invalid verb provided')
    }


}







module.exports = db;