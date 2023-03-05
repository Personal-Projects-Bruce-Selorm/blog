/**
 * base file for routes
 */


//dependencies
const { Router } = require('express');
const db = require('./db_connection');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb')





// routes contaianr
var handler = Router();

var allowedMethods = ['get', 'post', 'put', 'delete']

handler.use(bodyParser.json());


//rejeect any method  that is not allowed
handler.use(function (req, res, next) {
    if (allowedMethods.indexOf(req.method.toLowerCase()) > -1) {
        handler[req.method.toLowerCase()](req, res, next);
    } else {
        res.status(400).send('bad method')
    }

})

/**
 * @todo  refactor handler object to handle ech specific query with respective verb
 */

/**
 * 
 * @param {*} data 
 * insert  end-point
 * required fileds: title,author,body,
 * optional fields: featured_image_url, published
 * default fields: {publised:false}, created_on:new Date()}
 */

handler.post = function (req, res, next) {

    //validate data
    var title = typeof req.body.title == 'string' && req.body.title.trim().length > 0 ? req.body.title.trim() : false;
    var author = typeof req.body.author == 'string' && req.body.author.trim().length > 0 ? req.body.author.trim() : false;
    var body = typeof req.body.body == 'string' && req.body.body.trim().length > 0 ? req.body.body.trim() : false;
    if (title && author && body) {

        if (data.featured_image_url) {
            var featured_image_url = typeof req.body.featured_image_url == 'string' && req.body.featured_image_url.trim().length > 0 ? req.body.featured_image_url.trim() : '';
        }
        if (data.published) {
            var published = typeof req.body.published == 'boolean' && req.body.published == true ? req.body.published : false;
        }
        // form post body
        var payload = {
            title: title,
            author: author,
            body: body,
            featured_image_url: featured_image_url,
            published: published,
            created_on: new Date()

        }

        // push data to db

        db.send(payload, 'insertOne', function (bool, promise) {
            if (bool) {
                console.log(promise)
                res.status(200).send({ success: "record created" })
            } else {
                console.log("could not process db query")
            }

        });



    } else {
        res.status(401).send({ Error: "one or more filds are invalid" })
    }




}

/**
 * 
 * @param {*} data 
 * find  end-point
 * required fileds: search query 
 */
handler.get = function (req, res, next) {
    /**
 * @todo  refactor handler object to handle each veerb differently
*/
    // determine the search key
    if (Object.keys(req.query).length > 0) {
        var key = Object.keys(req.query)[0]
    } else {
        res.status(401).send("no search parameter provided")
    }

    var searchKey = typeof key == 'string' && ['id', 'q'].indexOf(key) > -1 ? key.trim() : false;
    if (searchKey) {
        var collectionVerb = searchKey === 'id' ? 'findOne' : 'find';
        //validate  query value
        var value = typeof req.query[searchKey] == 'string' && req.query[searchKey].trim().length > 0 ? req.query[searchKey].trim() : false;
        if (!value) {
            res.status(401).send("a valid search value is required")
        }

        if (searchKey === 'id') {
            searchObject = {
                _id: new ObjectId(value)
            }
        } else {
            searchObject =
            {
                title: value
            }


        }

        db.send(searchObject, collectionVerb, function (bool, promise) {
            if(bool){
                  res.status(200).send(promise)
            }else{
                res.status(400).send('something happend')
            }
          
        })


    }
}


handler.use(function (req, res) {
    res.status(404).send("Sorry, can't find that!");
});



module.exports = handler;




















module.exports = handler