var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.enableStatistics = false;
config.test = {};
config.test.load = false;
config.test.executeOnStart = false;
config.scan = {};
config.scan.automatic = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        app.factory.invoke(null, "sum", "1.0.0", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });

        app.factory.invoke(null, "sum", "3.0.0", {y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 13, "igual");
        });

        app.factory.invoke(null, "sum", "3.0.0", {x:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 8, "igual");
        });

        app.factory.invoke(null, "sum", "3.0.0", {}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 15, "igual");
        });

        app.factory.invoke(null, "sum", "3.0.0", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 15, "igual");
        });

        app.factory.invoke(null, "sum", "4.0.0", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });
    }
});