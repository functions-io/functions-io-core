const ModuleFactory = require("../../lib/ModuleFactory");
const MemoryRegistry = require("../../lib/MemoryRegistry");
const HttpNpmDataStore = require("../../lib/dataStore/HttpNpmDataStore");
const memoryRegistry = new MemoryRegistry();

memoryRegistry.addRegistryDataStore(new HttpNpmDataStore());

const moduleFactory = new ModuleFactory(memoryRegistry);

moduleFactory.requireAsync("uuid", "3.2.1", function(err, moduloObj){
    if (err){
        console.log("err", err);
    }
    else{
        console.log("sucess!");
        
        console.log(moduloObj);
    }
});