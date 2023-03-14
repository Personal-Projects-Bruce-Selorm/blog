/**
 * base file for logs
 */
//Dependencies

const path = require('path')
const zlib = require('zlib')
const fs = require('fs')



//logs conatiner
var logs = {};

const basePath = path.join(__dirname + "/../.data/")
const folder_name = "logs";
const date = new Date();
const dateExtention = "_" + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();


logs.loop = function () {
    setInterval(() => {
        logs.main();
    }, 1000 * 60 * 60 * 24)
}






//compress file
logs.compress = function (callback) {
    //destination file 
    const destinationFile = "logs" + dateExtention + ".gz.b64";
    //read log content
    fs.readFile(basePath + folder_name + "/" + "logs.log", 'utf-8', function (err, buffer) {
        if (!err && buffer) {
            //go ahead and compress the file using zlip.gzip
            zlib.gzip(buffer, function (err, compressedBuffer) {
                if (!err && compressedBuffer && compressedBuffer.length > 0) {

                    //create destination file
                    fs.open(basePath + folder_name + "/" + destinationFile, "wx", function (err, fileDescriptor) {
                        if (!err && fileDescriptor) {
                            //write to destination file
                            fs.writeFile(fileDescriptor, compressedBuffer.toString("base64"), function (err) {
                                if (!err) {
                                    console.log("zip file written successfully");
                                    //close file after writing
                                    fs.close(fileDescriptor, function (err) {
                                        if (!err) {
                                            console.log("log compress completed")
                                            callback(true)
                                        } else {
                                            console.log("couls not close file after writing compress file to it")
                                            callback(false)
                                        }
                                    })
                                } else {
                                    console.log("could not  write compressed data to file")
                                    callback(false)
                                }
                            })


                        } else {

                            console.log("file exist already")
                            callback(false)
                        }
                    })
                    //write buffer to destination file

                } else {
                    console.log("could not compress file ", err)
                    callback(false)
                }
            })

        } else {
            console.log("couuld not read file for compression ", err)
            callback(false)
        }
    })







}


//deconpress logs
logs.decompress = function () {

}

//truncate log

logs.truncate = function () {
    //truncate file
    fs.open(basePath + folder_name + "/" + "logs.log", "w", function (err, fd) {
        if (!err) {
            fs.ftruncate(fd, 0, function (err) {
                if (!err) {

                    fs.close(fd, function (err) {
                        if (!err) {
                            console.log("file truncated");
                        } else {
                            console.log("could not close file ", err)
                        }
                    })
                } else {
                    console.log("could not truncate file, will try in 24hrs ", err)
                }
            })
        } else {
            console.log("could not open fle for truncation")
        }
    })


}



logs.main = function () {



    // compress log file 
    logs.compress(function (bool) {
        if (bool) {
            //truncate log after compress
            logs.truncate();
        } else {
            console.log("could not compress file")
        }
    })
    //repeat same process every 24 hrs

    logs.loop();

}





module.exports = logs;