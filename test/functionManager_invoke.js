var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.enableStatistics = false;
config.unitTest = {};
config.unitTest.load = false;
config.unitTest.executeOnStart = false;
config.scan = {};
config.scan.automatic = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        app.factory.invoke(null, "sum", "v1", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });

        app.factory.invoke(null, "sum", "v3", {y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 13, "igual");
        });

        app.factory.invoke(null, "sum", "v3", {x:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 8, "igual");
        });

        app.factory.invoke(null, "sum", "v3", {}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 15, "igual");
        });

        app.factory.invoke(null, "sum", "v3", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 15, "igual");
        });

        app.factory.invoke(null, "sum", "v4", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });
    }
});