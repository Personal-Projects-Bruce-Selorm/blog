/**
 * base file for routes
 */


//dependencies
const { Router } = require('express');
const db = require('./db_connection');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb')


/**
* @todo  refactor handler  to allow only authenticated users to  edit,update or delete thier posts
*/


// routes contaianr
var handler = Router();

var allowedMethods = ['get', 'post', 'put', 'delete']

handler.use(bodyParser.json());

const collection_name  ="posts"

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

        if (req.body.featured_image_url) {
            var featured_image_url = typeof req.body.featured_image_url == 'string' && req.body.featured_image_url.trim().length > 0 ? req.body.featured_image_url.trim() : '';
        }
        if (req.body.published) {
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

        db.send(payload, collection_name,'insertOne', function (bool, promise) {
            if (bool && promise.acknowledged == true) {
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

        db.send(searchObject,collection_name, collectionVerb, function (bool, promise) {
            if (bool && promise) {
                res.status(200).send(promise)
            } else {
                res.status(400).send('record may not exist')
            }

        })


    }
}


/**
 * update
 * @param id
 * required fields _id
 * optional  title,body,featured_image_url,published,author
 */
handler.put = function (req, res, next) {
    var id = typeof req.query.id == 'string' && req.query.id.trim().length > 0 ? req.query.id.trim() : false;
    // optional fields
    var title = typeof req.body.title == 'string' && req.body.title.trim().length > 0 ? req.body.title.trim() : false;
    var author = typeof req.body.author == 'string' && req.body.author.trim().length > 0 ? req.body.author.trim() : false;
    var body = typeof req.body.body == 'string' && req.body.body.trim().length > 0 ? req.body.body.trim() : false;
    var featured_image_url = typeof req.body.featured_image_url == 'string' && req.body.featured_image_url.trim().length > 0 ? req.body.featured_image_url.trim() : false;
    var published = typeof req.body.published == 'boolean' && req.body.published == true ? req.body.published : false;
    if (id) {
        if (title || author || body || featured_image_url || published) {
            var data = {};


            if (title) {
                data.title = title
            }

            if (author) {
                data.author = author
            }

            if (body) {
                data.body = body
            }

            if (featured_image_url) {
                data.featured_image_url = featured_image_url
            }

            if (published) {
                data.title = published
            }

            updateObject = [
                { _id: new ObjectId(id) },
                { $set: data }

            ]

            db.send(updateObject, collection_name,'updateOne', function (bool, promise) {
                if (bool && promise.acknowledged == true) {
                    console.log(promise)
                    res.status(200).send('record updated')
                } else {
                    res.status(400).send('something happend')
                }

            })


        } else {
            res.status(403).send('one or more fileds are required ')
        }

    } else {
        res.status(403).send('a valid id is required to update a file')
    }

}


/**
 * delete  required field = id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

handler.delete = function (req, res, next) {
    var id = typeof req.query.id == 'string' && req.query.id.trim().length > 0 ? req.query.id.trim() : false;
    if (id) {
        var deleteObject = { _id: new ObjectId(id) }

        db.send(deleteObject,collection_name, 'deleteOne', function (bool, promise) {
            if (bool && promise.deletedCount == 1) {
                console.log(promise)
                res.status(200).send("record deleted successfully")
            } else {
                res.status(400).send('something happend')
            }

        })


    } else {
        res.status(401).send("valid post id is required to delete a post")
    }


}


handler.use(function (req, res) {
    res.status(404).send("Sorry, can't find that!");
});



module.exports = handler;

