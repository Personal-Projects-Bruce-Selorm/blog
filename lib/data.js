/**
 * base file for CRUD operations on file system
 */

//Dependenciees
const fs = require('fs')
const path = require('path')


var data = {};


const basePath = path.join(__dirname + "/../.data/")


// Create
/**
 * @param file
 * @param data
 * @param callback
 */
data.create = function (folder, file, data, callback) {
    fs.open(basePath + folder + "/" + file + '.json', 'wx', function (err, fd) {
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
data.read = function (folder, file, callback) {

    fs.readFile(basePath + folder + "/" + file + '.json', 'utf-8', function (err, data) {
        if (!err && data && data.length > 0) {
            //convert data to an object
            try {
                var dataObject = JSON.parse(data);
                callback(dataObject)
            } catch (error) {
                callback(false)
            }

        } else {
            console.log(err)
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

data.update = function (folder, file, data, callback) {
    console.log("hello world")
    fs.open(basePath + folder + "/" + file + '.json', function (err, filedescriptor) {

        if (!err && filedescriptor) {

            //update file

            fs.writeFile(basePath + folder + "/" + file + '.json', JSON.stringify(data), function (err) {
                console.log(err, '1')
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

data.delete = function (folder, file, callback) {
    fs.unlink(basePath + folder + "/" + file + '.json', function (err) {
        if (!err) {
            callback(true)

        } else {
            callback(false)
        }
    })
}


data.readDir = function (folder, callback) {

    //read all files i the folder
    var fileArray = [];
    fs.readDir(basePath + folder, function (err, files) {
        if (!err && files && files.length > 0) {
            files.forEach((file) => {
                //remove .json from file
                fileArray.push(file.replace(".log", ""));

            })
            callback(true, fileArray)

        } else {
            callback(false, { Error: "could not read directory" })
        }
    })

}


module.exports = data;