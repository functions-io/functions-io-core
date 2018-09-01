const functionsio = require("../");
functionsio.config.listRegistry = ["https://127.0.0.1:8443"];

const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();

moduleFactory.requireAsync("@my-company/service.math", "1")
    .then(function(moduleObj){
        console.log(moduleObj.sum(5,5));
        console.log(moduleObj.multiply(5,5));
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });