/**
 * base file for routes
 */


//dependencies
const { Router } = require('express');
const db = require('./db_connection');
const bodyParser = require('body-parser');





// routes contaianr
var handler = Router();

var allowedMethods = ['get', 'post', 'put', 'delete']

handler.use(bodyParser.json());


//rejeect any method  that is not allowed
handler.use(function (req, res) {
    if (allowedMethods.indexOf(req.method.toLowerCase()) > -1) {
        handler[req.method.toLowerCase()](req.body, res);
    } else {
        res.status(400).send('bad method')
    }

})

/**
 * 
 * @param {*} data 
 * insert  end-point
 * required fileds: title,author,body,
 * optional fields: featured_image_url, published
 * default fields: {publised:false}, created_on:new Date()}
 */

handler.post = function (data, res) {

    //validate data
    var title = typeof data.title == 'string' && data.title.trim().length > 0 ? data.title.trim() : false;
    var author = typeof data.author == 'string' && data.author.trim().length > 0 ? data.author.trim() : false;
    var body = typeof data.body == 'string' && data.body.trim().length > 0 ? data.body.trim() : false;
    if (title && author && body) {

        if (data.featured_image_url) {
            var featured_image_url = typeof data.featured_image_url == 'string' && data.featured_image_url.trim().length > 0 ? data.featured_image_url.trim() : '';
        }
        if (data.published) {
            var published = typeof data.published == 'boolean' && data.published == true ? data.published : false;
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

        db.send(payload,  'insertOne');
        res.status(200).send({ success: "record created" })


    } else {
        res.status(401).send({ Error: "one or more filds are invalid" })
    }




}


handler.use(function (req, res) {
    res.status(404).send("Sorry, can't find that!");
});


module.exports = handler;




















module.exports = handler