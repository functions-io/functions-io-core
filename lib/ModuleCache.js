"use strict";

const log = require("./log");
const semver = require("semver");

var ModuleCache = function(){
    this.cacheObjects = new Map();
    this.cacheModuleNameVersion = new Map();
    
    function getKey(moduleName, moduleVersion){
        return moduleName + "@" + moduleVersion;
    }

    this.parseVersion = function(moduleName, moduleVersion){
        if (semver.valid(moduleVersion) === null){
            let listVersion = this.cacheModuleNameVersion.get(moduleName);
            if (listVersion !== undefined){
                return semver.maxSatisfying(listVersion, moduleVersion, true);
            }
            else{
                return null;
            }
        }
        else{
            return moduleVersion;
        }
    };

    this.addVersionInModuleNameList = function(moduleName, moduleVersion){
        //listVersion
        var listVersion = this.cacheModuleNameVersion.get(moduleName);
        if (listVersion === undefined){
            listVersion = [];
            this.cacheModuleNameVersion.set(moduleName, listVersion);
        }
        if (listVersion.indexOf(moduleVersion) === -1){
            listVersion.push(moduleVersion);
        }
    };

    this.addObjectInCache = function(moduleName, moduleVersion, fileName, obj, manifest){
        //protect
        if (semver.valid(moduleVersion) === null){
            console.error("Version error", moduleName, moduleVersion, fileName, manifest);
            return;
        }

        if (obj){
            var keyCache = getKey(moduleName, moduleVersion);
            var mainCacheItem = this.cacheObjects.get(keyCache);
            
            if (!mainCacheItem){
                mainCacheItem = {};
                mainCacheItem.moduleName = moduleName;
                mainCacheItem.moduleVersion = moduleVersion;
                mainCacheItem.create = new Date();
                mainCacheItem.lastAccess = new Date();
                mainCacheItem.countAccess = 0;
                mainCacheItem.listObject = new Map();
                mainCacheItem.moduleObj = null;
                mainCacheItem.moduleManifestObj = null;
                mainCacheItem.size = 0;
                mainCacheItem.timeCompile = 0;
                mainCacheItem.countCompile = 0;

                this.cacheObjects.set(keyCache, mainCacheItem);

                this.addVersionInModuleNameList(moduleName, moduleVersion);
            }
    
            if (manifest){
                if (manifest.size){
                    mainCacheItem.size += manifest.size;
                }
                if (manifest.timeCompile){
                    mainCacheItem.timeCompile += manifest.timeCompile;
                }
                if (manifest.timeCompile !== undefined){
                    mainCacheItem.countCompile ++;
                }
            }

            if (fileName){
                mainCacheItem.listObject.set(fileName, obj);
                log.debug(__filename, "addObjectInCache", {key:keyCache, fileName:fileName});
            }
            else{
                mainCacheItem.moduleObj = obj;
                mainCacheItem.moduleManifestObj = manifest;

                log.info(__filename, "addObjectInCache", {key:keyCache, size:mainCacheItem.size, countCompile:mainCacheItem.countCompile, timeCompile:mainCacheItem.timeCompile});
            }
        }
    };

    this.getObjectInCache = function(moduleName, moduleVersion, fileName){
        let targetVersion = this.parseVersion(moduleName, moduleVersion);
        
        if (!targetVersion){
            return null;
        }
        
        var keyCache = getKey(moduleName, targetVersion);
        
        var mainCacheItem = this.cacheObjects.get(keyCache);
        if (mainCacheItem){
            mainCacheItem.lastAccess = new Date();
            mainCacheItem.countAccess ++;

            if (fileName){
                return mainCacheItem.listObject.get(fileName) || null;
            }
            else{
                return mainCacheItem.moduleObj || null;
            }
        }
        else{
            return null;
        }
    };
};

module.exports = ModuleCache;