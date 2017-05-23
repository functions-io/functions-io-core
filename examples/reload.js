var functionsio = require("../");
var app = null;
var config = {};

var callFunction = function(){
    try{
        app.factory.invoke(null, "subfolder.subfolder3.sum", "1.0.0", {x:2,y:3}, null, function(err, data){
            if (err){
                console.error("err in invoke subfolder.subfolder3.sum-v1 -> " + err);
            }
            else{
                console.log("Call subfolder.subfolder3.sum-v1(2, 3) = " + data.value);
            }
        });
    }
    catch(err){
        console.log("subfolder.subfolder3.sum-v1 ->" + err.message);
    }
}

config.enableStatistics = true;
config.test = {};
config.test.load = false;
config.test.executeOnStart = false;

app = functionsio.createServer(config);
app.pathFunctions = __dirname + "/../test/functions";

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        setInterval(callFunction, 10000);
    }
});