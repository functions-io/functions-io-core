const functionsio = require("../../../../");
const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();
moduleFactory.requireAsync("@performance3/service.math.1", "1")
    .then(function(moduleObj){
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });