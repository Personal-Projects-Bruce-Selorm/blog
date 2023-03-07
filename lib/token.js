/**
 * base file for generatng tokens
 */

//Dependenciees
const fs = require('fs')
const path = require('path')
const { Router } = require('express');
const bodyParser = require('body-parser');
const util = require('../lib/utils')
const data  = require('../lib/data');


//tokens container

// routes contaianer
var token = Router();

var allowedMethods = ['get', 'post', 'put', 'delete']

token.use(bodyParser.json());


//rejeect any method  that is not allowed
token.use(function (req, res, next) {
    if (allowedMethods.indexOf(req.method.toLowerCase()) > -1) {
        token[req.method.toLowerCase()](req, res, next);
    } else {
        res.status(400).send('bad method')
    }

})


/**
 * @param req
 * @param res
 * @param next
 * required fields  phone,
 */

token.post = function (req, res, next) {
    
    var phone = typeof req.body.phone == 'string' && req.body.phone.trim().length == 10 ? req.body.phone.trim() : false;
    if (phone) {
        var tokenObject  = {
            phone:phone,
            token:util.generateToken(40),
            expires:   Date.now() + (1000 *60 *60)
        }
            data.create(tokenObject.token,tokenObject,function(bool,message){
                console.log(bool,message)
                if(bool && message){
                    res.type("json")
                    res.status(200).send(JSON.stringify(tokenObject))

                }else{
                    res.status(500).send('internal server ')
                }
            })




    } else {
        res.status(403).send("valid phone number is required");
    }

}


/**
 * @param req
 * @param res
 * @param next
 * required fields  token,
 */
token.get = function(req,res,next){
    console.log(req.query.token.length)
        //validate phone
        var token = typeof req.query.token == 'string' && req.query.token.trim().length == 40 ? req.query.token.trim() : false;
        if(token){
            data.read(token,function(bool,content){
                if(bool && content){
                    res.type('json')
                    res.status(403).send(JSON.stringify(content))
                }else{
                    res.status(403).send('could not read token')
                }
            })

        }else{
            res.status(403).send('invalid token')
        }
}


/**
 * @param req
 * @param res
 * @param next
 * required fields  token,
 */
token.get = function(req,res,next){
    console.log(req.query.token.length)
        //validate phone
        var token = typeof req.query.token == 'string' && req.query.token.trim().length == 40 ? req.query.token.trim() : false;
        if(token){
            data.read(token,function(bool,content){
                if(bool && content){
                    res.type('json')
                    res.status(403).send(JSON.stringify(content))
                }else{
                    res.status(403).send('could not read token')
                }
            })

        }else{
            res.status(403).send('invalid token')
        }
}


/**
 * @param req
 * @param res
 * @param next
 * required fields  token,
 */
token.delete = function(req,res,next){
    
        //validate phone
        var token = typeof req.query.token == 'string' && req.query.token.trim().length == 40 ? req.query.token.trim() : false;
        if(token){
            data.delete(token,function(bool,message){
                if(bool && message){
                    res.type('json')
                    res.status(403).send(JSON.stringify(message))
                }else{
                    res.status(403).send('could not delete token')
                }
            })

        }else{
            res.status(403).send('invalid token')
        }
}








module.exports = token;