const path = require("path");

const functionsio = require("../");
const moduleFactory = functionsio.buildModuleFactory({pathModules: path.join(process.cwd(), "labs", "functions")});

var tempo1 = new Date().getTime();

moduleFactory.requireAsync("@my-company/math.sum", "2")
    .then(function(moduleObj){
        console.log(moduleObj(2,3));
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });