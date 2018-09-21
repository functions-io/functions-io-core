const functionsio = require("../../lib");
const invokeFactory = functionsio.buildInvokeFactory();

setTimeout(function(){
    invokeFactory.invokeAsync("@functions-io-labs/math.sum.async", "1", {x:2,y:10})
        .then(function(result){
            console.log("test1", "result => ", result);
        }).catch(function(err){
            console.log("test1", "err", err);
        });
}, 1);

setTimeout(function(){
    invokeFactory.invokeAsync("@functions-io-labs/math.sum.async", "1", {x:4,y:10})
        .then(function(result){
            console.log("test2", "result => ", result);
        }).catch(function(err){
            console.log("test2", "err", err);
        });
}, 1000);

setTimeout(function(){
    console.log("test 3");
    var message = {};
    message.id = 1;
    message.jsonrpc = "2.0";
    message.scope = "functions-io-labs";
    message.method = "math.sum.async";
    message.version = "1";
    message.params = {x:20,y:3};
    invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
        if (errInvoke){
            console.log("test3", "err", errInvoke);
        }
        else{
            console.log("test3", "result => ", messageResponse);
        }
    });
}, 2000);