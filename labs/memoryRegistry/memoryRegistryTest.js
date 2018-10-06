const core = require("../../lib/index");
const moduleFactory = core.buildModuleFactory();
const memoryRegistry = moduleFactory.memoryRegistry;

memoryRegistry.getDataStoreInRegistry("uuid", "3.2.1", false, function(err, dataStore){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!");
        
        console.log(JSON.parse(dataStore["package.json"].payload));
    }
});

memoryRegistry.getDataStore("uuid", "3.2.1", function(err, dataStore){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!");
        
        console.log(JSON.parse(dataStore["package.json"].payload));
    }
});

memoryRegistry.getFileBuffer("async", "2.X", "package.json", function(err, payload){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!");
        
        console.log(JSON.parse(payload));
    }
});