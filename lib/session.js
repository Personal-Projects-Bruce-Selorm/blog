/**
 * BASE FILE FOR USER AUTHENTICATION
 */

//dependencies
const { Router } = require('express');
require('dotenv').config()
const { CONNEECTION_STRING, DB_NAME } = process.env;
const db = require('../db/db_connection');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const util = require('../lib/utils');
const token = require('./token');



/**
 * @todo Add rate limiting to prevent brute-force attck
 */

// file specific configuration
collection_name = "users"



// routes contaianer
var session = Router();

var allowedMethods = ['get', 'post', 'put', 'delete']

session.use(bodyParser.json());


//rejeect any method  that is not allowed
session.use(function (req, res) {
    if (allowedMethods.indexOf(req.method.toLowerCase()) > -1) {
        session[req.method.toLowerCase()](req, res);
    } else {
        res.status(400).send('bad method')
    }

})


/**
 * @param req
 * @param res

 * required fields  phone,name,password,tosAgreement
 * optional field   none
 */




session.post = function (req, res) {

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
                db.send(user, collection_name, "insertOne", function (bool, promise) {
                    if (bool && promise) {

                        res.status(200).send("user created successfully")
                    } else {

                        res.status(400).send('sorry, user with same phone number exist')


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


/**
 * required field id
 * @param req
 * @param res
 * 
 */

session.get = function (req, res) {
    //validate field
    var phone = typeof req.body.phone == 'string' && req.body.phone.trim().length == 10 ? req.body.phone.trim() : false;
    var password = typeof req.body.password == 'string' && req.body.password.trim().length >= 8 ? req.body.password.trim() : false;


    //only authorised users
    if (phone && password) {

        util.hashPassword(phone, function (hashedPhone) {
            if (hashedPhone) {
                util.rateLimit(hashedPhone, function (bool, message) {
                    if (bool && message) {
                        // form filter
                        var searchObject = {
                            phone: phone
                        }
                        //query db
                        db.send(searchObject, collection_name, "findOne", function (bool, user) {
                            if (bool && user) {

                                //compare password
                                util.hashPassword(password, function (hashedPassword) {
                                    console.log(hashedPassword, user.password, "me")
                                    if (hashedPassword === user.password) {

                                        //for a new login, generate new token for user
                                        token.post(phone, function (newTokenObject) {

                                            if (newTokenObject) {
                                                user.token = newTokenObject;
                                                req.session.user = user;
                                                res.type('json')
                                                res.status(200).send(user)

                                            } else {
                                                res.status(500).send({ Error: "we could not generate a token for your session. re-login" })
                                            }
                                        })


                                    } else {
                                        res.status(403).send({ Error: "invalid username or password" })
                                    }
                                })


                            } else {
                                res.status(404).send('no match found')
                            }
                        })

                    } else {
                        res.status(401).send(message)
                    }

                })
            } else {
                res.send("error hashing user phone")
            }

        })





    } else {
        res.status(401).send("invalid username and password")
    }

}


/**
 * update
 * required id
 * optional  name,password
 * @param req
 * @param res

 */

session.put = function (req, res) {

    //validate field
    var token = typeof req.query.token == 'string' && req.query.token.trim().length == 20 ? req.query.token.trim() : false;
    var phone = typeof req.query.phone == 'string' && req.query.phone.trim().length == 10 ? req.query.phone.trim() : false;

    var name = typeof req.body.name == 'string' && req.body.name.trim().length > 0 ? req.body.name.trim() : false;
    var password = typeof req.body.password == 'string' && req.body.password.trim().length >= 8 ? req.body.password.trim() : false;
    if (token && phone && (name || password)) {

        util.verifyUser(phone, token, function (bool) {

            if (bool) {
                var data = {};
                if (name) {
                    data.name = name

                }
                if (password) {
                    util.hashPassword(password, function (hashedPassword) {
                        if (hashedPassword) {
                            data.password = hashedPassword
                        } else {
                            res.status(500).send("internal server error, could not hash new password")
                        }
                    })

                }
                var queryObject = [
                    { phone: phone },
                    { $set: data }
                ]

                db.send(queryObject, collection_name, "updateOne", function (bool, promise) {
                    if (bool && promise) {
                        res.status(200).send("record updated successfuly")

                    } else {
                        res.status(500).send("internal server error, we could not update your details, try again later")
                    }
                })

            } else {
                res.status(403).send("unauthorised")
            }
        })


    } else {
        res.status(403).send('all mandatory fields are required')
    }

}


/**
 * delete  required field = id
 * @param {*} req 
 * @param {*} res 

 */

/**
 * @todo refactor this function into smaller functions
 */
session.delete = function (req, res) {
    var token = typeof req.query.token == 'string' && req.query.token.trim() ? req.query.token.trim() : false;
    var phone = typeof req.query.phone == 'string' && req.query.phone.trim().length == 10 ? req.query.phone.trim() : false;

    if (phone && token) {
        util.verifyUser(phone, token, function (isVerified) {
            console.log(isVerified)
            if (isVerified) {

                var deleteUserObject = { phone: phone }
                var deleteUserPostObject = { "user.phone": phone }
                //only perform transaction if user has associatd posts
                db.userHasPosts(deleteUserPostObject, function (userHasPosts) {
                    if (userHasPosts) {
                        console.log("user has posts")
                        //connect to Atlas Cluster

                        const cleint = new MongoClient(CONNEECTION_STRING)
                        const connectToAtlasCluster = async () => {
                            try {
                                await cleint.connect();
                                console.log('connected to atlas')
                            } catch (err) {
                                console.log(err)

                            }
                        }

                        const runTransaction = async () => {
                            try {

                                const database = cleint.db(DB_NAME);
                                const _session = cleint.startSession();
                                _session.startTransaction();
                                //delete all user posts
                                await database.collection("posts").deleteMany(deleteUserPostObject);


                                //delete user
                                await database.collection("users").deleteOne(deleteUserObject);

                                await _session.commitTransaction()
                                res.status(200).send("user with all associated posts are deleted")

                            } catch (err) {
                                await _session.abortTransaction();
                                res.status(400).send("could not delete user with all associated posts")

                            } finally {
                                await cleint.close()
                            }
                        }
                        connectToAtlasCluster();
                        runTransaction();
                    } else {
                        console.log("user has no posts")
                        db.send(deleteObject, collection_name, 'deleteOne', function (bool, promise) {
                            if (bool && promise.deletedCount == 1) {
                                console.log(promise)
                                res.status(200).send("record deleted successfully")
                            } else {
                                res.status(400).send('something happend')
                            }

                        })
                    }
                })

            } else {
                res.status(403).send("unauthorised")

            }
        })




    } else {
        res.status(401).send("all fields are required")
    }


}


session.use(function (req, res) {
    res.status(404).send("Sorry, can't find that!");
});



module.exports = session;