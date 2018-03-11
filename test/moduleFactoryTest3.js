const functionsio = require("../");
const moduleFactory = functionsio.buildModuleFactory();

moduleFactory.requireAsync("chalk", "2")
    .then(function(chalk){
        console.log(chalk);
        console.log(chalk.blue('Hello world!'));
    }).catch(function(err){
        console.log("erro", err);
    });