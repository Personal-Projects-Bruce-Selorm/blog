/**
 * base file for utils
 */

//dependencies 
const fs = require('fs')
const path = require('path')



const util  = {};

//create index if it does not exist
var filePath = path.join(__dirname + '/index.json');


//create file if it does not eexist and wrute into it
util.createIndex = function(db_name,collection_name,index_name){
    fs.readFile(filePath, 'utf-8', function (err, content) {
        if (!err && content.length > 0) {
            var content = JSON.parse(content);
            if (content.indexExists == true) {
                util.createIndex(db_name,collection_name,index_name,client);
            }
    
        } else {
            fs.open(filePath, 'wx', function (err, filedescriptor) {
                if (!err && filedescriptor) {
                    fs.writeFile(filedescriptor, JSON.stringify({ indexExists: false }), function (err) {
                        if (!err) {
                            util.createIndex(db_name,collection_name,index_name,client);
                            console.log("index status writen to false")
    
                        } else {
                            console.log("could not write to file ", err);
                        }
                    })
                } else {
                    console.log('could not open file for writing ', err)
                }
            })
        }
    })
}


//check if collection exist before creating index
util.createIndex = async (db_name,collection_name,index_name,cleint) => {
    try {
        console.log({ "collection": collection_name }, { "dbName": db_name })
        var result = await cleint.db(db_name).listCollections({ name: collection_name }).toArray();


        if (result.length == 1) {
            //check to see if  index exist already otherwise create it
            console.log('creating index now')
            var indexExist = await cleint.db(db_name).collection(collection_name).indexExists(index_name)
            if (!indexExist) {
                //create index
                await cleint.db(db_name).collection(collection_name).createIndex({ title: 1 }, { unique: true })
                console.log('index created')
                fs.writeFile(filePath, JSON.stringify({ indexExists: true }), function (err) {
                    if (!err) {
                        console.log('index status updated in file')
                    } else {
                        console.log('could not update index status')
                    }
                })
            }
        } else {
            //create collection
            await cleint.db(db_name).createCollection(collection_name);
            console.log('collection created')

            //create index
            await cleint.db(db_name).collection(collection_name).createIndex({ title: 1 }, { unique: true })
            console.log('index created')
            fs.writeFile(filePath, JSON.stringify({ indexExists: true }), function (err) {
                if (!err) {
                    console.log('index status updated in file')
                } else {
                    console.log('could not update index status')
                }
            })


        }
    } catch (error) {
        console.log(error)

    }
}


module.exports =util;
