const functionsio = require("../");
const moduleFactory = functionsio.buildModuleFactory();

moduleFactory.requireAsync("mongodb", "3")
    .then(function(mongodb){
        const MongoClient = mongodb.MongoClient;
        const assert = require('assert');
        
        const url = 'mongodb://localhost:27017';
        
        const dbName = 'myproject';
        
        MongoClient.connect(url, function(err, client) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            
            const db = client.db(dbName);
            
            const collection = db.collection('documents');

            collection.insertMany([{a : 1}, {a : 2}, {a : 3}], function(err, result) {
                assert.equal(err, null);
                assert.equal(3, result.result.n);
                assert.equal(3, result.ops.length);
                console.log("Inserted 3 documents into the collection");

                console.log(result);
                client.close();
            });
        });
    }).catch(function(err){
        console.log("erro", err);
    });