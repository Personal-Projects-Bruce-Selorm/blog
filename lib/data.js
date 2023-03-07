/**
 * base file for CRUD operations on file system
 */

//Dependenciees
const fs = require('fs')
const path = require('path')


var data = {};


const basePath = path.join(__dirname + "/../.data/tokens/")


// Create
/**
 * @param file
 * @param data
 * @param callback
 */
data.create = function (file, data, callback) {
    fs.open(basePath + file + '.json', 'wx', function (err, fd) {
        if (!err && fd) {
          
            //write data to file
            var stringData = JSON.stringify(data)
            fs.writeFile(fd, stringData, function (err) {
                if (!err) {
                    //close file after writing
                    fs.close(fd, function (err) {
                        if (!err) {
                            delete data.phone
                            callback(data)
                        } else {
                            callback(false)
                        }
                    })
                } else {
                    callback(false)
                }
            })
        } else {
            callback(false)
        }
    })
}


//read
/**
 * @param file
 * @param callback
 */
data.read = function (file, callback) {

    fs.readFile(basePath + file + '.json', 'utf-8', function (err, data) {
        if (!err && data && data.length > 0) {
            //convert data to an object
            try {
                var dataObject = JSON.parse(data);
                callback(dataObject)
            } catch (error) {
                callback(false)
            }
 
        } else {
            callback(false)
        }
    })

}

//update
/**
 * @param file
 * @param data
 * @param callback
 */

data.update = function (file, data, callback) {
    fs.open(basePath + file + '.json', function (err, filedescriptor) {
        if (!err && filedescriptor) {
            //update file

            fs.writeFile(filedescriptor, JSON.stringify(data), function (err) {
                if (!err) {
                    fs.close(filedescriptor, function (err) {
                        if (!err) {
                            callback(true)
                        } else {
                            callback(false)
                        }
                    })
                } else {
                    callback(false)
                }
            })
        } else {
            callback(false)
        }
    })
}




/**
 * @param file
 */

data.delete = function (file, callback) {
    fs.unlink(basePath + file + '.json', function (err) {
        if (!err) {
            callback(true)

        } else {
            callback(false)
        }
    })
}


module.exports = data;