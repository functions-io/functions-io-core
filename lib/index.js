"use strict";

const ModuleFactory = require("./ModuleFactory");
const MemoryRegistry = require("./MemoryRegistry");
const HttpNpmDataStore = require("./dataStore/HttpNpmDataStore");
const Http2NpmDataStore = require("./dataStore/Http2NpmDataStore");
const config = require("./config");

module.exports.createHttpNpmDataStore = function(){
    let httpNpmDataStore = new HttpNpmDataStore();
    return httpNpmDataStore;
}

module.exports.createHttp2NpmDataStore = function(){
    let http2NpmDataStore = new Http2NpmDataStore();
    return http2NpmDataStore;
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
    
    //memoryRegistry.addRegistryDataStore(module.exports.createHttpNpmDataStore());
    memoryRegistry.addRegistryDataStore(module.exports.createHttp2NpmDataStore());
    
    let moduleFactory = module.exports.createModuleFactory(memoryRegistry);

    return moduleFactory;
}