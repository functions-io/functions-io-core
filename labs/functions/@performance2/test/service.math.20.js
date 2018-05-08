const functionsio = require("../../../../");
const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();
moduleFactory.requireAsync("@performance2/service.math.20", "1")
    .then(function(moduleObj){
        var tempo2 = new Date().getTime();
        moduleObj.sum(2,3);
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });