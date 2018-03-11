var path = require("path");

var functionsio = require("../");
var moduleFactory = functionsio.buildModuleFactory({pathModules: path.join(process.cwd(), "test", "functions")});

moduleFactory.requireAsync("@my-company/math.sum", "2")
    .then(function(moduleObj){
        console.log(moduleObj(2,3));
    }).catch(function(err){
        console.log("erro", err);
    });