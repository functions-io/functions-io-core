"use strict";

const ModuleFactory = require("./ModuleFactory");
const InvokeFactory = require("./InvokeFactory");

module.exports.config = {};
module.exports.config.moduleRegistryDataStore = null;

module.exports.createHttpNpmDataStore = function(){
    let HttpNpmDataStore = require("./dataStore/HttpNpmDataStore");
    let httpNpmDataStore = new HttpNpmDataStore();
    return httpNpmDataStore;
};

module.exports.createModuleFactory = function(){
    return new ModuleFactory();
};

module.exports.buildModuleFactory = function(){
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

    let moduleFactory = new ModuleFactory();
    moduleFactory.moduleCache.searchAndLoadLocalModulesInNodeModulesFolder(true); //isLazy
    moduleFactory.memoryRegistry.addRegistryDataStore(moduleRegistryDataStore);
    return moduleFactory;
};

module.exports.buildInvokeFactory = function(){
    let moduleFactory = this.buildModuleFactory();
    return new InvokeFactory(moduleFactory);
};