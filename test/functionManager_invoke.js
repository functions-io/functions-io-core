var assert = require("assert");
var functionsio = require("../");
var app = functionsio.createServer();;
var functionManager = null;

app.config.path = __dirname + "/functions";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        app.functionsInvoke.invoke(null, "sum", "1.0.0", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });

        app.functionsInvoke.invoke(null, "sum", "3.0.0", {y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 13, "igual");
        });

        app.functionsInvoke.invoke(null, "sum", "3.0.0", {x:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 8, "igual");
        });

        app.functionsInvoke.invoke(null, "sum", "3.0.0", {}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 15, "igual");
        });

        app.functionsInvoke.invoke(null, "sum", "3.0.0", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 15, "igual");
        });

        app.functionsInvoke.invoke(null, "sum", "4.0.0", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });
    }
});