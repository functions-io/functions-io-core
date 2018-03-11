var functionsio = require("../");
var moduleFactory = functionsio.buildModuleFactory();

moduleFactory.requireAsync("uuid", "3.2.1")
    .then(function(module){
        console.log("module", module.v4());
        console.log("module", module.v4());
        console.log("module", module.v4());
    }).catch(function(err){
        console.log("erro", err);
    });