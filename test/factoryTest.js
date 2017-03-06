var functionsio = require("../");
var assert = require("assert");
var functionManager = null;
var app = null;
var config = {};

config.isGenerateStatistics = false;
config.unitTest = {};
config.unitTest.load = false;
config.unitTest.executeOnStart = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/functions";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        functionManager = app.factory.getFunctionManager(null, "sys.stats", null);
        assert.equal(functionManager.module.category, "sys");
        assert.equal(typeof functionManager.module.exports, "function");
        functionManager.module.exports(null, {}, function(err, data){
            assert.equal(err, null);
        });

        functionManager = app.factory.getFunctionManager(null, "subfolder.subfolder2.sum", "v1");
        assert.equal(functionManager.module.category, "test2");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "subfolder.subfolder2.multiply", "v1");
        assert.equal(functionManager.module.category, "test2");
        assert.equal(functionManager.module.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "subfolder.sum", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "multiply", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v2");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, false);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");
        
        functionManager.module.exports(null, {x:2,y:3}, function(err, data){
            assert.equal(err, null);
            assert.equal(data.value, 5);
        });

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
    }
});