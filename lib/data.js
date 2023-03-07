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
          console.log(fd)
            //write data to file
            var stringData = JSON.stringify(data)
            fs.writeFile(fd, stringData, function (err) {
                if (!err) {
                    //close file after writing
                    fs.close(fd, function (err) {
                        if (!err) {
                            callback(true, { success: "file written" })
                        } else {
                            callback(false, { Error: "error closing fidle after writing" })
                        }
                    })
                } else {
                    callback(false, { Error: `error ${err}` })
                }
            })
        } else {
            callback(false, { Error: "could not open file for writing" })
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
                callback(true, dataObject)
            } catch (error) {
                callback(false, { Error: "could not parse data" })
            }

        } else {
            callback(false, { Error: `error reading file ${err}` })
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
                            callback(true, { success: "record updated" })
                        } else {
                            callback(false, { Error: `could not close file  after update ${err}` })
                        }
                    })
                } else {
                    callback(false, { Error: `could not update file` })
                }
            })
        } else {
            callback(false, { Error: "error opening file" })
        }
    })
}




/**
 * @param file
 */

data.delete = function (file, callback) {
    fs.unlink(basePath + file + '.json', function (err) {
        if (!err) {
            callback(true, { success: "file deleted successfuly" })

        } else {
            callback(false, { Error: "could not delete file" })
        }
    })
}


module.exports = data;