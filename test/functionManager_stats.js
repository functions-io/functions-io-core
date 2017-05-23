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
        functionManager = app.factory.getFunctionManager(null, "sys.stats", null);
        assert.equal(functionManager.category, "sys");
        assert.equal(typeof functionManager.module.exports, "function");
        functionManager.module.exports(null, {}, function(err, data){
            assert.equal(err, null);
        });
    }
});