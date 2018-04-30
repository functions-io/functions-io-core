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

        //dataStore

        console.log(memoryRegistry.getFileBufferInCache("uuid", "3.2.1", "lib/sha1.js").toString());
    }
});