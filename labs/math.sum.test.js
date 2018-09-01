const functionsio = require("../");
const moduleFactory = functionsio.buildModuleFactory();

functionsio.config.listRegistry.push({url:"https://127.0.0.1:8443", scope:"my-company"});

var tempo1 = new Date().getTime();

moduleFactory.requireAsync("@my-company/math.sum", "1")
    .then(function(moduleObj){
        console.log(moduleObj(2,3));
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });

setTimeout(function(){
    console.log("test 2");
    moduleFactory.invokeAsync("@my-company/math.multiply", "1", [2,10])
        .then(function(result){
            console.log(result);
        }).catch(function(err){
            console.log("erro", err);
        });
}, 1000);