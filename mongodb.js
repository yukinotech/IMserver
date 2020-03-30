const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';


// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
// module.exports = client

client.connect(function(err) {

  console.log("Connected successfully to server");

  const db = client.db('IMdb');

  const collection = db.collection('users');
  // Insert some documents
  
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {

    console.log("Inserted 3 documents into the collection");

  });

  client.close();
});

