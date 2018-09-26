const functionsio = require("../../lib");
const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();
moduleFactory.requireAsync("@functions-io-labs/service.sum", "1")
    .then(function(moduleObj){
        console.log(moduleObj(5,5));
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });