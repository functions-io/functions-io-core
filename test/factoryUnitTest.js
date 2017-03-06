var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.isGenerateStatistics = false;
config.unitTest = {};
config.unitTest.load = true;
config.unitTest.executeOnStart = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions";

app.start(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        functionManager = app.factory.getFunctionManager("_unitTest", "sum.test", null);
        assert.equal(typeof functionManager.module.test, "object");
        assert.equal(typeof functionManager.module.exports, "function");
        
        app.factory.invoke("_unitTest", "sum.test", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            //console.log(data);
        });
        
        app.factory.invoke("_unitTest", "multiply.test", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            //console.log(data);
        });

        app.factory.invoke(null, "sys.unitTest", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
            //console.log(data);
        });
    }
});