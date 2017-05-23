var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.enableStatistics = false;
config.unitTest = {};
config.unitTest.load = true;
config.unitTest.executeOnStart = false;
config.scan = {};
config.scan.automatic = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions";

app.start(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        functionManager = app.factory.getFunctionManager("_test", "sum", "v1");
        assert.equal(typeof functionManager.module.test, "object");
        assert.equal(typeof functionManager.module.exports, "function");
        
        app.factory.invoke("_test", "sum", "v1", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            //console.log(data);
        });
        
        app.factory.invoke("_test", "multiply", "v1", null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            //console.log(data);
        });

        app.factory.invoke(null, "sys.test", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            //console.log(data);
        });
    }
});