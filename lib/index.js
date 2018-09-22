"use strict";

const ModuleFactory = require("./ModuleFactory");
const MemoryRegistry = require("./MemoryRegistry");
const InvokeFactory = require("./InvokeFactory");

module.exports.config = {};
module.exports.config.moduleRegistryDataStore = null;

module.exports.createHttpNpmDataStore = function(){
    let HttpNpmDataStore = require("./dataStore/HttpNpmDataStore");
    let httpNpmDataStore = new HttpNpmDataStore();
    return httpNpmDataStore;
};

module.exports.createMemoryRegistry = function(dataStoreArray){
    let memoryRegistry = new MemoryRegistry();
    
    if (Array.isArray(dataStoreArray)){
        dataStoreArray.map(function(itemDataStore){
            memoryRegistry.addRegistryDataStore(itemDataStore);
        });
    }

    return memoryRegistry;
};

module.exports.createModuleFactory = function(memoryRegistry){
    if (memoryRegistry instanceof MemoryRegistry){
        let moduleFactory = new ModuleFactory(memoryRegistry);

        return moduleFactory;
    }
    else{
        throw new TypeError("memoryRegistry invalid");
    }
};

module.exports.buildModuleFactory = function(){
    let memoryRegistry = module.exports.createMemoryRegistry();
    let moduleRegistryDataStore = null;
    
    if (module.exports.config.moduleRegistryDataStore){
        if (typeof(module.exports.config.moduleRegistryDataStore) === "string"){
            moduleRegistryDataStore = require(module.exports.config.moduleRegistryDataStore)();
        }
        else{
            moduleRegistryDataStore = module.exports.config.moduleRegistryDataStore;
        }
    }
    else{
        moduleRegistryDataStore = module.exports.createHttpNpmDataStore();
    }

    memoryRegistry.addRegistryDataStore(moduleRegistryDataStore);
    
    let moduleFactory = module.exports.createModuleFactory(memoryRegistry);

    return moduleFactory;
};

module.exports.buildInvokeFactory = function(){
    let moduleFactory = this.buildModuleFactory();
    return new InvokeFactory(moduleFactory);
};