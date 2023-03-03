/**
 * base file for db conneection and dbbase definations
 */

//depeendencies
const { MongoClient } = require('mongodb')
require('dotenv').config()
const { DB_CONNEECTION, DB_NAME } = process.env;

// db container 
var db = {};

//db setup

const cleint = new MongoClient(DB_CONNEECTION)
const db_name = DB_NAME;

//get collection instance with name

/**
 * @param name
 */
db.collection = function (name, callback) {
    //validate collection name 
    var collectionName = typeof name == 'string' && name.trim().length > 0 && ['insertOne', 'insertMany', 'findOne', 'find', 'pdateOne', 'updateMany', 'deleteOne', 'deleteMay'].indexOf(name) > -1 ? name : false;

    if (collectionName) {

        var value = cleint.db(db_name).collection(collectionName);

        callback(value)
    } else {
        callback(false)
    }
}


/**
 * @param data
 * @param colection_name
 * @param collection_verb
 */

db.main = function (data, colection_name, collection_verb) {
    db.collection(colection_name, function (collection) {
        if (collection) {

            const send = async () => {
                try {

                    await collection[collection_verb](data)
                    console.log('successful')

                } catch (err) {
                    console.error(err)
                } finally {
                    await cleint.close();
                }
            }
            send()

        } else {
            console.log({ error: "collection name does not meet requirement" })
        }
    })

}







module.exports = db;