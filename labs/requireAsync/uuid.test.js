const functionsio = require("../../lib");
const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();

moduleFactory.requireAsync("uuid/v4", "*")
    .then(function(moduleObj){
        console.log(moduleObj());
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });