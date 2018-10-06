const functionsio = require("../../lib");
const moduleFactory = functionsio.buildModuleFactory();

moduleFactory.requireAsync("uuid", "3.2.1", function(err, moduloObj){
    if (err){
        console.log("err", err);
    }
    else{
        console.log("sucess!");
        
        console.log(moduloObj);
    }
});