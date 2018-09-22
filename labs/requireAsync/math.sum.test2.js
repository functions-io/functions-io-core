const core = require("../../lib");
core.config.moduleRegistryDataStore = core.createHttpNpmDataStore();
core.config.moduleRegistryDataStore.config.listRegistry = [
    {url:"http://127.0.0.1:9080"},
    {url:"https://registry.npmjs.org"}
];
const moduleFactory = core.buildModuleFactory();

var tempo1 = new Date().getTime();

moduleFactory.requireAsync("@functions-io-labs/math.sum", "1")
    .then(function(moduleObj){
        console.log(moduleObj(2,3));
        var tempo2 = new Date().getTime();
        console.log("time: ", (tempo2 - tempo1));
    }).catch(function(err){
        console.log("erro", err);
    });