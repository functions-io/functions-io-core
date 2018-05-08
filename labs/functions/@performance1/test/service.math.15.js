const functionsio = require("../../../../");
const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();
moduleFactory.requireAsync("@performance1/service.math.15", "1")
    .then(function(moduleObj){
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });