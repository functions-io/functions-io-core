"use strict";

const Config = require("./Config");
const ModuleFactory = require("./ModuleFactory");
const InvokeFactory = require("./InvokeFactory");
const HttpNpmDataStore = require("./dataStore/HttpNpmDataStore");
const log = require("./log");

module.exports.log = log;

module.exports.createConfig = function(p_file){
    return new Config(p_file);
};

module.exports.config = module.exports.createConfig();

module.exports.log.level = log.parseLevel(module.exports.config.get("core.log.level", "INFO"));

module.exports.createHttpNpmDataStore = function(){
    let httpNpmDataStore = new HttpNpmDataStore();

    httpNpmDataStore.config.registryCircuitBreakerTimeOut = module.exports.config.get("registry.circuitBreakerTimeOut", 10000);
    httpNpmDataStore.config.requestTimeout = module.exports.config.get("registry.requestTimeout", 5000);
    httpNpmDataStore.config.listRegistry = [];

    let tmpListRegistryRemoteURL = module.exports.config.get("registry.remote.url", "https://registry.npmjs.org").split(",");
    for (var i = 0; i < tmpListRegistryRemoteURL.length; i++){
        let remoteURL = tmpListRegistryRemoteURL[i].trim();
        httpNpmDataStore.config.listRegistry.push({url:remoteURL});
    }

    return httpNpmDataStore;
};

module.exports.createModuleFactory = function(){
    return new ModuleFactory();
};

module.exports.buildModuleFactory = function(p_moduleRegistryDataStore){
    let moduleRegistryDataStore = null;
    
    if (p_moduleRegistryDataStore){
        moduleRegistryDataStore = p_moduleRegistryDataStore;
    }
    else{
        moduleRegistryDataStore = module.exports.createHttpNpmDataStore();
    }

    let moduleFactory = new ModuleFactory();

    let blackListLocalModules = module.exports.config.get("core.cache.blackListLocalModules", null);
    if (blackListLocalModules){
        moduleFactory.moduleCache.blackListLocalModules = blackListLocalModules;
    }

    moduleFactory.moduleCache.searchAndLoadLocalModulesInNodeModulesFolder(true); //isLazy
    moduleFactory.memoryRegistry.addRegistryDataStore(moduleRegistryDataStore);
    return moduleFactory;
};

module.exports.buildInvokeFactory = function(){
    let moduleFactory = this.buildModuleFactory();
    return new InvokeFactory(moduleFactory);
};