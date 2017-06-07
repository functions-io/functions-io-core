var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.enableStatistics = false;
config.test = {};
config.test.load = true;
config.test.executeOnStart = false;
config.scan = {};
config.scan.automatic = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions3";

app.start(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        functionManager = app.factory.getFunctionManager("_test", "sum", "1.0.0");
        assert.equal(typeof functionManager.module.test, "object");
        assert.equal(typeof functionManager.module.exports, "function");
        
        app.factory.invoke("_test", "sum", "1.0.0", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            assert.equal(data.listResult[0].success, true);
            assert.equal(data.listResult[0].description, "test 2 + 3 = 5");
            assert.equal(data.listResult[1].success, true);
            assert.equal(data.listResult[1].description, "test 2 + 8 = 10");
        });

        app.factory.invoke("_test", "sum", "2.0.0", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, false);
            assert.equal(data.listResult[0].success, false);
            assert.equal(data.listResult[0].description, "test 2 + 3 = 5");
            assert.equal(data.listResult[0].error, "context.invokeNotExistFunctionThrowError is not a function");
            assert.equal(data.listResult[1].success, true);
            assert.equal(data.listResult[1].description, "test 2 + 8 = 10");
        });
        
        app.factory.invoke(null, "sys.test", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, false);

            assert.equal(data.listResult[0].success, true);
            assert.equal(data.listResult[0].name, "sum");
            assert.equal(data.listResult[0].listResult[0].success, true);
            assert.equal(data.listResult[0].listResult[0].description, "test 2 + 3 = 5");
            assert.equal(data.listResult[0].listResult[1].success, true);
            assert.equal(data.listResult[0].listResult[1].description, "test 2 + 8 = 10");

            assert.equal(data.listResult[1].success, false);
            assert.equal(data.listResult[1].name, "sum");
            assert.equal(data.listResult[1].listResult[0].success, false);
            assert.equal(data.listResult[1].listResult[0].description, "test 2 + 3 = 5");
            assert.equal(data.listResult[1].listResult[0].error, "context.invokeNotExistFunctionThrowError is not a function");
            assert.equal(data.listResult[1].listResult[1].success, true);
            assert.equal(data.listResult[1].listResult[1].description, "test 2 + 8 = 10");
        });
    }
});