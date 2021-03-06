const express = require('express');
const server = express();
//const Joi = require('joi');
const cors = require('cors');
const body_parser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

server.use(express.json());
server.use(cors());
server.use(body_parser.json());

if (process.env.NODE_ENV ===  "production") {
  server.use(express.static("client/build"));
}
 // << db setup >>
const db = require("./db.js");
const dbName = "data";
const collectionName = "movies";

const port = process.env.PORT || 3001;

// << db init >>
db.initialize(dbName, collectionName, function(dbCollection) { // successCallback
    // get all items
    dbCollection.find().toArray(function(err, result) {
        if (err) throw err;
          console.log(result);
    });

    // << db CRUD routes >>
    server.post("/api/items", (request, response) => {
       const item = request.body;
       dbCollection.insertOne(item, (error, result) => { // callback of insertOne
          if (error) throw error;
          // return updated list
          dbCollection.find().toArray((_error, _result) => { // callback of find
             if (_error) throw _error;
             response.json(_result);
          });
       });
     });

    server.get("/api/items/:id", (request, response) => {
       const itemId = request.params.id;

       dbCollection.findOne({ id: itemId }, (error, result) => {
          if (error) throw error;
          // return item
          response.json(result);
       });
    });

    server.get("/api/items", (request, response) => {
       // return updated list
       dbCollection.find().toArray((error, result) => {
          if (error) throw error;
          response.json(result);
       });
    });

    server.put("/api/items/:id", (request, response) => {
       const itemId = request.params.id;
       const item = request.body;
       console.log("Editing item: ", itemId, " to be ", item);

       dbCollection.updateOne({ id: itemId }, { $set: item }, (error, result) => {
          if (error) throw error;
          // send back entire updated list, to make sure frontend data is up-to-date
          dbCollection.find().toArray(function (_error, _result) {
             if (_error) throw _error;
             response.json(_result);
          });
       });
    });

    server.delete("/api/items/:id", (request, response) => {
       const itemId = request.params.id;
       console.log("Delete item with id: ", itemId);

       dbCollection.deleteOne({ id: itemId }, function (error, result) {
          if (error) throw error;
          // send back entire updated list after successful request
          dbCollection.find().toArray(function (_error, _result) {
             if (_error) throw _error;
             response.json(_result);
          });
       });
    });

}, function(err) { // failureCallback
    throw (err);
});

server.listen(port, () => {console.log(`Listening on port ${port}...`)});
