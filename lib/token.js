/**
 * base file for generatng tokens
 */

//Dependenciees

const util = require('../lib/utils')
const data = require('../lib/data');



//tokens container

// routes contaianer
var token = {};

const tokenFolder = "tokens";


token.post = function (phone, callback) {

    var phone = typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    if (phone) {
        var tokenObject = {
            phone: phone,
            token: util.generateRandomCharacters(20),
            expires: Date.now() + (1000 * 60 * 60)
        }

        data.create(tokenFolder, tokenObject.token, tokenObject, function (newTokenObject) {

            if (newTokenObject) {
                callback(newTokenObject)

            } else {
                callback(false)
            }
        })


    } else {
        callback(false)
    }

}




token.get = function (token, callback) {

    //validate token
    var token = typeof req.query.token == 'string' && req.query.token.trim() ? req.query.token.trim() : false;
    if (token) {
        data.read(tokenFolder, token, function (tokenObject) {
            if (tokenObject) {
                callback(tokenObject)
            } else {
                callback(false)
            }
        })

    } else {
        callback(false)
    }
}

//update token/ aka extend token time
token.put = function (token, extend = false, callback) {

    //as along as user is on page, extend token
    //validate token
    var token = typeof req.query.token == 'string' && req.query.token.trim() ? req.query.token.trim() : false;
    data.read(tokenFolder, token, function (tokenData) {
        if (tokenData) {
            tokenData.expires = tokenData.expires + (1000 * 60 * 60)
            //persist changes to file
            data.update(tokenFolder, token, tokenData, function (output) {
                if (output) {
                    callback(true)
                } else {
                    callback(false)

                }
            })
        } else {
            callback(false)
        }
    })


}






token.delete = function (token, callback) {

    //validate phone
    var token = typeof req.query.token == 'string' && req.query.token.trim() ? req.query.token.trim() : false;
    if (token) {
        data.delete(tokenFolder, token, function (bool) {
            if (bool) {
                callback(true)
            } else {
                callback(false)
            }
        })

    } else {
        callback(false)
    }
}








module.exports = token;