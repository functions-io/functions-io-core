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
        functionManager = app.factory.getFunctionManager(null, "subfolder.subfolder2.sum", "v1");
        assert.equal(functionManager.category, "test2");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "subfolder.subfolder2.multiply", "v1");
        assert.equal(functionManager.category, "test2");
        assert.equal(functionManager.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "subfolder.sum", "v1");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "multiply", "v1");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v2");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, false);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v1");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v4");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, false);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");
        
        functionManager.module.exports(null, {x:2,y:3}, function(err, data){
            assert.equal(err, null);
            assert.equal(data.value, 5);
        });
    }
});