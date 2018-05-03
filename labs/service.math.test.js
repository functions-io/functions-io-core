const path = require("path");

const functionsio = require("../");
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