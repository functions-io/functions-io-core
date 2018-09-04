const functionsio = require("../lib");
const invokeFactory = functionsio.buildInvokeFactory();

functionsio.config.listRegistry.push({url:"https://127.0.0.1:9443", scope:"my-company"});

var tempo1 = new Date().getTime();

invokeFactory.moduleFactory.requireAsync("@my-company/math.sum", "1")
    .then(function(moduleObj){
        console.log(moduleObj(2,3));
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });

setTimeout(function(){
    console.log("test 2");
    invokeFactory.invokeAsync("@my-company/math.multiply", "1", [2,10])
        .then(function(result){
            console.log(result);
        }).catch(function(err){
            console.log("erro", err);
        });
}, 1000);

setTimeout(function(){
    console.log("test 3");
    var message = {};
    message.id = 1;
    message.jsonrpc = "2.0";
    message.scope = "my-company";
    message.method = "math.multiply";
    message.version = "1";
    message.params = [20,3];
    invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
        console.log(errInvoke, messageResponse);
    });
}, 2000);