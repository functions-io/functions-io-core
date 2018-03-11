const MemoryRegistry = require("../lib/MemoryRegistry");
const HttpNpmDataStore = require("../lib/dataStore/HttpNpmDataStore");
const memoryRegistry = new MemoryRegistry();

memoryRegistry.addRegistryDataStore(new HttpNpmDataStore());

memoryRegistry.getDataStoreInRegistry("uuid", "3.2.1", function(err, dataStore){
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