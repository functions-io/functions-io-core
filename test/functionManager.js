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
        functionManager = app.functionsInvoke.functionsFactory.getFunctionManager(null, "subfolder.subfolder2.sum", "1.0.0");
        assert.equal(functionManager.category, "test2");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.functionsInvoke.functionsFactory.getFunctionManager(null, "subfolder.subfolder2.multiply", "1.0.0");
        assert.equal(functionManager.category, "test2");
        assert.equal(functionManager.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.functionsInvoke.functionsFactory.getFunctionManager(null, "subfolder.sum", "1.0.0");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.functionsInvoke.functionsFactory.getFunctionManager(null, "multiply", "1.0.0");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.functionsInvoke.functionsFactory.getFunctionManager(null, "sum", "2.0.0");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, false);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.functionsInvoke.functionsFactory.getFunctionManager(null, "sum", "1.0.0");
        assert.equal(functionManager.category, "test");
        assert.equal(functionManager.description, "sum x + y");
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
    }
});