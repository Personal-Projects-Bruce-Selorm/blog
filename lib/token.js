/**
 * base file for generatng tokens
 */

//Dependenciees
const fs = require('fs')
const path = require('path')
const { Router } = require('express');
const bodyParser = require('body-parser');
const util = require('../lib/utils')
const data = require('../lib/data');


//tokens container

// routes contaianer
var token = {};




token.post = function (phone, callback) {
    
    var phone = typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    if (phone) {
        var tokenObject = {
            phone: phone,
            token: util.generateToken(40),
            expires: Date.now() + (1000 * 60 * 60)
        }
      
        data.create(tokenObject.token, tokenObject, function (newTokenObject) {

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
    var token = typeof req.query.token == 'string' && req.query.token.trim().length == 40 ? req.query.token.trim() : false;
    if (token) {
        data.read(token, function (tokenObject) {
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






token.delete = function (token, callback) {

    //validate phone
    var token = typeof req.query.token == 'string' && req.query.token.trim().length == 40 ? req.query.token.trim() : false;
    if (token) {
        data.delete(token, function (bool) {
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