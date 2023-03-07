/**
 * base file for utils
 */

//dependencies 
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
require('dotenv').config()
const { SECRET } = process.env;




const util = {};

//create index if it does not exist
var filePath = path.join(__dirname + '/../.data/index.json');


//create file if it does not eexist and wrute into it
util.checkIfIndexExist = function (db_name, collection_name, index_name, client, callback) {
    console.log("checking and creating index")
    fs.readFile(filePath, 'utf-8', function (err, content) {
        if (!err && content.length > 0) {
            var content = JSON.parse(content);
            if (content.indexExists == true) {
                callback(true);
            } else {
                util.createIndex(db_name, collection_name, index_name, client);
                callback(false)
            }

        } else {
            fs.open(filePath, 'wx', function (err, filedescriptor) {
                if (!err && filedescriptor) {
                    fs.writeFile(filedescriptor, JSON.stringify({ indexExists: false }), function (err) {
                        if (!err) {
                            util.createIndex(db_name, collection_name, index_name, client);
                            console.log("index status writen to false")
                            callback(false)

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
util.createIndex = async (db_name, collection_name, index_name, cleint) => {
    try {

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
            await cleint.db(db_name).collection(collection_name).createIndex({ phone: 1 }, { unique: true })
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

//generate db query with parameters 

util.queryGenerator = async function (cleint, db_name, collection_name, collection_verb, data) {

    try {
        if (['insertOne', 'insertMany'].indexOf(collection_verb) > -1) {
            return await cleint.db(db_name).collection(collection_name)[collection_verb](data)
        }

        if (['findOne', 'find'].indexOf(collection_verb) > -1) {
            if ('findOne' === collection_verb) {
                return await cleint.db(db_name).collection(collection_name)[collection_verb](data)
            } else {
                return await cleint.db(db_name).collection(collection_name)[collection_verb](data).toArray()

            }
        }

        if (['updateOne', 'updateMany',].indexOf(collection_verb) > -1) {
            if (collection_verb === 'updateOne') {
                return await cleint.db(db_name).collection(collection_name)[collection_verb](data[0], data[1])

            } else {
                collection_verb = 'insertMany';
                return await cleint.db(db_name).collection(collection_name)[collection_verb](data)


            }

        }

        if (['deleteOne', 'deleteMany',].indexOf(collection_verb) > -1) {
            console.log('hello world')
            return await cleint.db(db_name).collection(collection_name)[collection_verb](data)

        }

    } catch (err) {
        console.error(err)
    }

}


util.hashPassword = function (password, callback) {
    //validate password 
    var password = typeof password == 'string' && password.trim().length >= 8 ? password.trim() : false;
    if (password) {
        try {
            var hashedPassword = crypto.createHmac('sha256', SECRET).update(password).digest('hex')
            callback(hashedPassword)

        } catch (err) {
            callback(false)

        }

    } else {
        callback(false)
    }
}
util.generateToken = function (count) {
    var characterPool = 'abcdefghijklmnopqrstuvwxyz1234567890'
    var token = '';
    for (var i = 0; i < count; i++) {
        //get a random character
        token += characterPool.charAt(Math.round(Math.random() * characterPool.length));

    }
    return token;

}


module.exports = util;
