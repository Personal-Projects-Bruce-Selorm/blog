/**
 * BASE FILE FOR USER AUTHENTICATION
 */

//dependencies
const { Router } = require('express');
const db = require('./db_connection');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const util = require('./utils');



// file specific configuration
collection_name = "users"



// routes contaianer
var session = Router();

var allowedMethods = ['get', 'post', 'put', 'delete']

session.use(bodyParser.json());


//rejeect any method  that is not allowed
session.use(function (req, res, next) {
    if (allowedMethods.indexOf(req.method.toLowerCase()) > -1) {
        session[req.method.toLowerCase()](req, res, next);
    } else {
        res.status(400).send('bad method')
    }

})


/**
 * @param req
 * @param res
 * @param next
 * required fields  phone,name,password,tosAgreement
 * optional field   none
 */




session.post = function (req, res, next) {
    console.log(req.body)
    //validate fields
    var name = typeof req.body.name == 'string' && req.body.name.trim().length > 0 ? req.body.name.trim() : false;
    var phone = typeof req.body.phone == 'string' && req.body.phone.trim().length == 10 ? req.body.phone.trim() : false;
    var password = typeof req.body.password == 'string' && req.body.password.trim().length >= 8 ? req.body.password.trim() : false;
    var tosAgreement = typeof req.body.tosAgreement == 'boolean' && req.body.tosAgreement == true ? req.body.tosAgreement : false;

    if (name && phone && password && tosAgreement) {
        util.hashPassword(password, function (data) {
            if (data) {
                // form user object 
                var user = {
                    name: name,
                    phone: phone,
                    password: data,
                    tosAgreement: tosAgreement
                }
                db.send(user,collection_name,"insertOne",function (bool, promise) {
                    if (bool && promise) {
                        console.log(promise)
                        res.status(200).send("user created successfully")
                    } else {
                        res.status(400).send('something happend')
                    }
        
                })


            } else {
                res.status(500).send("internal server error, could not harsh password, please try again later")
            }
        })



    } else {
        res.status(403).send(" all fields are required and should match requiremeent")
    }



}



module.exports = session;