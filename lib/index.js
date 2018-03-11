"use strict";

const ModuleFactory = require("./ModuleFactory");
const MemoryRegistry = require("./MemoryRegistry");
const FolderDataStore = require("./dataStore/FolderDataStore");
const HttpNpmDataStore = require("./dataStore/HttpNpmDataStore");

var config = null;

module.exports.createFolderDataStore = function(config){
    let folderDataStore = new FolderDataStore();
    if (config){
        if (config.pathModules){
            folderDataStore.baseFolder = config.pathModules;
        }
    }
    return folderDataStore;
}

module.exports.createHttpNpmDataStore = function(config){
    let httpNpmDataStore = new HttpNpmDataStore();
    if (config){
        if (config.enableCacheDisk){
            httpNpmDataStore.enableCacheDisk = config.enableCacheDisk;
        }
    }
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

module.exports.buildModuleFactory = function(config){
    let memoryRegistry = module.exports.createMemoryRegistry();
    memoryRegistry.addRegistryDataStore(module.exports.createFolderDataStore(config));
    memoryRegistry.addRegistryDataStore(module.exports.createHttpNpmDataStore(config));

    let moduleFactory = module.exports.createModuleFactory(memoryRegistry);

    return moduleFactory;
}