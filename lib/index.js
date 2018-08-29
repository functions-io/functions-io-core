"use strict";

const config = require("./config");
const ModuleFactory = require("./ModuleFactory");
const MemoryRegistry = require("./MemoryRegistry");

module.exports.config = config;

module.exports.createHttpNpmDataStore = function(){
    let HttpNpmDataStore = require("./dataStore/HttpNpmDataStore");
    let httpNpmDataStore = new HttpNpmDataStore();
    return httpNpmDataStore;
}

module.exports.createMemoryRegistry = function(dataStoreArray){
    let memoryRegistry = new MemoryRegistry();
    
    if (Array.isArray(dataStoreArray)){
        dataStoreArray.map(function(itemDataStore){
            memoryRegistry.addRegistryDataStore(itemDataStore);
        })
    }

    return memoryRegistry;
}

module.exports.createModuleFactory = function(memoryRegistry){
    if (memoryRegistry instanceof MemoryRegistry){
        let moduleFactory = new ModuleFactory(memoryRegistry);

        return moduleFactory;
    }
    else{
        throw new TypeError("memoryRegistry invalid");
    }
}

module.exports.buildModuleFactory = function(){
    let memoryRegistry = module.exports.createMemoryRegistry();
    let moduleRegistryDataStore = null;
    
    if (config.moduleRegistryDataStore){
        moduleRegistryDataStore = require(config.moduleRegistryDataStore)();
    }
    else{
        moduleRegistryDataStore = module.exports.createHttpNpmDataStore();
    }

    memoryRegistry.addRegistryDataStore(moduleRegistryDataStore);
    
    let moduleFactory = module.exports.createModuleFactory(memoryRegistry);

    return moduleFactory;
}