const functionsio = require("../../lib");
const invokeFactory = functionsio.buildInvokeFactory();

invokeFactory.invokeAsync("@functions-io-labs/math.sum.async", "1", {x:2,y:10})
        .then(function(result){
            console.log("test1", "result => ", result);
        }).catch(function(err){
            console.log("test1", "err", err);
        });