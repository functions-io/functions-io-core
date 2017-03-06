var functionsio = require("../");
var app = null;
var config = {};

config.isGenerateStatistics = true;
config.unitTest = {};
config.unitTest.load = false;
config.unitTest.executeOnStart = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/../test/functions";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        app.factory.invoke(null, "sum", "v1", {x:2,y:3}, null, function(err, data){
            if (err){
                console.error("err in invoke - " + err);
            }
            else{
                console.log("Call sum(2, 3) = " + data.value);
            }
        });
    }
});