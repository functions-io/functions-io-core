var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.isGenerateStatistics = false;
config.unitTest = {};
config.unitTest.load = false;
config.unitTest.executeOnStart = false;
config.scan = {};
config.scan.automatic = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions2";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        functionManager = app.factory.getFunctionManager(null, "sum", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");
        
        app.factory.invoke(null, "sum", "v1", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.value, 5, "igual");
        });
    }
});