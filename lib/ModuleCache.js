"use strict";

const path = require("path");
const fs = require("fs");
const log = require("./log");
const semver = require("semver");
const basePathNodeModules = (function seekNodeModules(){
    let folderNode_Modules;

    folderNode_Modules = path.join(path.dirname(require.main.filename), "node_modules");
    if (fs.existsSync(folderNode_Modules)){
        return folderNode_Modules;
    }

    folderNode_Modules = path.join(path.dirname(require.main.filename), "../", "node_modules");
    if (fs.existsSync(folderNode_Modules)){
        return folderNode_Modules;
    }

    folderNode_Modules = path.join(path.dirname(require.main.filename), "../../", "node_modules");
    if (fs.existsSync(folderNode_Modules)){
        return folderNode_Modules;
    }

    return null;
})();

var ModuleCache = function(){
    this.cacheLocalObjects = new Map();
    this.cacheRemoteObjects = new Map();
    this.cacheLocalModuleNameVersion = new Map();
    this.cacheRemoteModuleNameVersion = new Map();
    this.blackListLocalModules = ["functions-io-core", "functions-io"];

    function getKey(moduleName, moduleVersion){
        return moduleName + "@" + moduleVersion;
    }

    this.searchAndLoadLocalModulesInNodeModulesFolder = function(isLazy, basePath){
        if (!basePath){
            basePath = basePathNodeModules;
        }
        try {
            let listFiles = fs.readdirSync(basePath);
            for (var i = 0; i < listFiles.length; i++){
                let itemFile = listFiles[i];
                if (this.blackListLocalModules.indexOf(itemFile) === -1){
                    if (itemFile.substring(0,1) !== "."){
                        let filePath = path.join(basePath, itemFile);
                        try {
                            if (fs.statSync(filePath).isDirectory()){
                                if (itemFile.substring(0,1) === "@"){ //subfolder
                                    this.searchAndLoadLocalModulesInNodeModulesFolder(isLazy, filePath);
                                }
                                else{
                                    this.loadLocalObjectInCache(filePath, isLazy);
                                }
                            }                    
                        }
                        catch (errTry2) {
                            log.error(__filename, "searchAndLoadLocalModulesInNodeModulesFolder", {message:errTry2.message});
                        }
                    }
                }
            }            
        }
        catch (errTry) {
            log.error(__filename, "searchAndLoadLocalModulesInNodeModulesFolder", {message:errTry.message});
        }
    };

    this.parseVersion = function(moduleName, moduleVersion){
        var listVersion;
        if (semver.valid(moduleVersion) === null){
            listVersion = this.cacheRemoteModuleNameVersion.get(moduleName);
            if (listVersion !== undefined){
                return semver.maxSatisfying(listVersion, moduleVersion, true);
            }
            else{
                listVersion = this.cacheLocalModuleNameVersion.get(moduleName);
                if (listVersion !== undefined){
                    return semver.maxSatisfying(listVersion, moduleVersion, true);
                }
                else{
                    return null;
                }
            }
        }
        else{
            return moduleVersion;
        }
    };

    this.addVersionInRemoteModuleNameList = function(moduleName, moduleVersion){
        //listVersion
        var listVersion = this.cacheRemoteModuleNameVersion.get(moduleName);
        if (listVersion === undefined){
            listVersion = [];
            this.cacheRemoteModuleNameVersion.set(moduleName, listVersion);
        }
        if (listVersion.indexOf(moduleVersion) === -1){
            listVersion.push(moduleVersion);
        }
    };

    this.addVersionInLocalModuleNameList = function(moduleName, moduleVersion){
        //listVersion
        var listVersion = this.cacheLocalModuleNameVersion.get(moduleName);
        if (listVersion === undefined){
            listVersion = [];
            this.cacheLocalModuleNameVersion.set(moduleName, listVersion);
        }
        if (listVersion.indexOf(moduleVersion) === -1){
            listVersion.push(moduleVersion);
        }
    };

    this.addObjectInCache = function(moduleName, moduleVersion, fileName, obj, manifest){
        //protect
        if (semver.valid(moduleVersion) === null){
            log.error(__filename, "addObjectInCache", {moduleName:moduleName, moduleVersion:moduleVersion, fileName:fileName});
            return;
        }

        if (obj){
            var keyCache = getKey(moduleName, moduleVersion);
            var mainCacheItem = this.cacheRemoteObjects.get(keyCache);
            
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

                this.cacheRemoteObjects.set(keyCache, mainCacheItem);

                this.addVersionInRemoteModuleNameList(moduleName, moduleVersion);
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

                log.debug(__filename, "addObjectInCache", {key:keyCache, size:mainCacheItem.size, countCompile:mainCacheItem.countCompile, timeCompile:mainCacheItem.timeCompile});
            }
        }
    };

    this.loadLocalObjectInCache = function(modulePath, isLazy){
        //TODO: CHECK MODULES NOT PERMITED
        try {
            if (fs.existsSync(modulePath)){
                let obj = null;
                let manifestObj = {};
                manifestObj.modulePath = modulePath;
                if (!isLazy){
                    obj = require(modulePath);
                }
                manifestObj.packageObj = require(path.join(modulePath, "package.json"));
                //TODO: input output
                manifestObj.versions = [manifestObj.packageObj.version];

                log.debug(__filename, "loadLocalObjectInCache", {moduleName:manifestObj.packageObj.name, moduleVersion:manifestObj.packageObj.version});

                return this.addLocalObjectInCache(obj, manifestObj);
            }
        }
        catch (errTryLocalRequire) {
            log.error(__filename, "loadLocalObjectInCache", {message:errTryLocalRequire.message});
            return null;
        }
    };

    this.addLocalObjectInCache = function(obj, manifest){
        var mainCacheItem = {};
        
        mainCacheItem.moduleName = manifest.packageObj.name;
        mainCacheItem.moduleVersion = manifest.packageObj.version;
        mainCacheItem.moduleObj = obj;
        mainCacheItem.moduleManifestObj = manifest;
        
        this.addVersionInLocalModuleNameList(mainCacheItem.moduleName, mainCacheItem.moduleVersion);
        this.cacheLocalObjects.set(mainCacheItem.moduleName, mainCacheItem);
        
        return mainCacheItem;
    };

    this.getObjectInCache = function(moduleName, moduleVersion, fileName){
        var mainCacheItem;
        var keyCache;
        var targetVersion = this.parseVersion(moduleName, moduleVersion);
        
        if (!targetVersion){
            return null;
        }
        
        keyCache = getKey(moduleName, targetVersion);
        
        mainCacheItem = this.cacheRemoteObjects.get(keyCache);
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
            return this.getLocalObjectInCache(moduleName, moduleVersion);
        }
    };

    this.getLocalObjectInCache = function(moduleName, moduleVersion){
        var mainCacheItem = this.cacheLocalObjects.get(moduleName);

        if (mainCacheItem){
            if (semver.maxSatisfying(mainCacheItem.moduleManifestObj.versions, moduleVersion)){
                if (mainCacheItem.moduleObj){
                    return mainCacheItem.moduleObj;
                }
                else{
                    mainCacheItem.moduleObj = require(mainCacheItem.moduleManifestObj.modulePath);
                    return mainCacheItem.moduleObj;
                }
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    };

    this.getManifestInCache = function(moduleName, moduleVersion){
        let targetVersion = this.parseVersion(moduleName, moduleVersion);
        
        if (!targetVersion){
            return null;
        }
        
        var keyCache = getKey(moduleName, targetVersion);
        
        var mainCacheItem = this.cacheRemoteObjects.get(keyCache);
        if (mainCacheItem){
            mainCacheItem.lastAccess = new Date();
            mainCacheItem.countAccess ++;

            return mainCacheItem.moduleManifestObj || null;
        }
        else{
            return null;
        }
    };
};

module.exports = ModuleCache;