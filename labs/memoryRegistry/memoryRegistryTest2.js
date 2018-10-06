const core = require("../../lib/index");
const moduleFactory = core.buildModuleFactory();
const memoryRegistry = moduleFactory.memoryRegistry;

memoryRegistry.getDataStoreInRegistry("uuid", "3.2.1", false, function(err, dataStore){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!", dataStore);

        //dataStore

        console.log(memoryRegistry.getFileBufferInCache("uuid", "3.2.1", "lib/sha1.js").toString());
    }
});