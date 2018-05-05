const functionsio = require("../");
const moduleFactory = functionsio.buildModuleFactory();

var tempo1 = new Date().getTime();

moduleFactory.requireAsync("chalk", "2")
    .then(function(chalk){
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
        
        console.log(chalk);
        console.log(chalk.blue('Hello world!'));
    }).catch(function(err){
        console.log("erro", err);
    });