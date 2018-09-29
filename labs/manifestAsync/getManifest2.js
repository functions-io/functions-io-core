const functionsio = require("../../lib");
const invokeFactory = functionsio.buildInvokeFactory();

invokeFactory.getManifestAsync("@functions-io-labs/service.sum", "1")
    .then(function(result){
        console.log("test1", "result => ", result);
    }).catch(function(err){
        console.log("test1", "err", err);
    });