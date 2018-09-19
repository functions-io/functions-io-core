"use strict";

const log = require("./log");
const path = require("path");
const ModuleCompile = require("./ModuleCompile");
const onlyLettersRegex = /^[A-Za-z]+$/;
const semver = require("semver");

var ModuleFactory = function(p_memoryRegistry){
    var self = this;
    var listCurrentModulesCompile = {};

    this.cacheObjects = new Map();
    this.cacheModuleNameVersion = new Map();
    this.moduleCompile = new ModuleCompile();
    this.moduleConfig = require("./moduleConfig");
    this.memoryRegistry = p_memoryRegistry;

    function getKey(moduleName, moduleVersion){
        return moduleName + "@" + moduleVersion;
    }

    function parseModuleName(moduleName){
        let i = moduleName.indexOf("/");
        if (i === -1){
            return moduleName;
        }
        else{
            if (moduleName.substring(0,1) === "@"){
                let i2 = moduleName.indexOf(i + 1);
                if (i2 === -1){
                    return moduleName;
                }
                else{
                    return moduleName.substring(0, i2);
                }
            }
            else{
                return moduleName.substring(0, i);
            }
        }
    }

    this.invokeValidate = function(moduleObj, data, context){
        console.log("validate", moduleObj.__manifest, data, context);
        return null;
    };

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

    this.moduleCompile.requireModuleExtend = function(moduleName, moduleVersion, fileName, opt){
        //try search module defined in package.json
        var packageObj = self.requireSync(moduleName, moduleVersion, "package.json");
        if ((packageObj) && (packageObj.dependencies) && (packageObj.dependencies[fileName])){
            let fileNameVersion = packageObj.dependencies[fileName];

            return self.requireSync(fileName, fileNameVersion);
        }

        if (fileName.match(onlyLettersRegex)){
            //native require
            return require(fileName);
        }
        else{
            var absoluteFileName = path.join(path.dirname(opt.filePath), fileName);
            return self.requireSync(moduleName, moduleVersion, absoluteFileName);
        }
    };

    this.addObjectInCache = function(moduleName, moduleVersion, fileName, obj){
        if (obj){
            moduleVersion = this.parseVersion(moduleName, moduleVersion);
            if (moduleVersion === null){
                return null;
            }

            var keyCache = getKey(moduleName, moduleVersion);
            var mainCacheItem = this.cacheObjects.get(keyCache);
            if (mainCacheItem === undefined){
                mainCacheItem = {};
                mainCacheItem.create = new Date();
                mainCacheItem.lastAccess = new Date();
                mainCacheItem.countAccess = 0;
                mainCacheItem.listObject = new Map();
                mainCacheItem.moduleObj = null;
                
                this.cacheObjects.set(keyCache, mainCacheItem);

                //listVersion
                var listVersion = this.cacheModuleNameVersion.get(moduleName);
                if (listVersion === undefined){
                    listVersion = [];
                    this.cacheModuleNameVersion.set(moduleName, listVersion);
                }
                if (listVersion.indexOf(moduleVersion) === -1){
                    listVersion.push(moduleVersion);
                }
            }
    
            if (fileName){
                mainCacheItem.listObject.set(fileName, obj);
                log.debug(__filename, "addObjectInCache", {key:keyCache, fileName:fileName});
            }
            else{
                mainCacheItem.moduleObj = obj;
                log.info(__filename, "addObjectInCache", {key:keyCache});
            }
        }
    };

    this.getObjectInCache = function(moduleName, moduleVersion, fileName){
        moduleVersion = this.parseVersion(moduleName, moduleVersion);
        if (moduleVersion === null){
            return null;
        }
        
        var keyCache = getKey(moduleName, moduleVersion);
        
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

    this.requireAsync = function(requireModuleName, moduleVersion){
        return new Promise(function(resolve, reject){
            try {
                var objResult = self.getObjectInCache(requireModuleName, moduleVersion);
                if (objResult){
                    resolve(objResult);
                }
                else{
                    let moduleName = parseModuleName(requireModuleName);
                    //self.memoryRegistry.getDataStore(moduleName, moduleVersion, function(err, buffer, versionTarget){
                    self.memoryRegistry.getDataStore(moduleName, moduleVersion, function(err){
                        try {
                            if (err){
                                reject(err);
                            }
                            else{
                                objResult = self.requireSync(requireModuleName, moduleVersion);
        
                                if (objResult){
                                    self.memoryRegistry.removeDataStoreInCache(moduleName, moduleVersion);
        
                                    resolve(objResult);
                                }
                                else{
                                    let errObj = {};
                                    errObj.code = -32601;
                                    errObj.message = "Module not found";
                                    errObj.data = {};
                                    errObj.data.moduleName = requireModuleName;
                                    errObj.data.version = moduleVersion;
        
                                    reject(errObj);
                                }
                            }
                        }
                        catch (errTry2) {
                            let errObj = {};
                            errObj.code = -32000;
                            errObj.message = errTry2.message;
                            errObj.data = {};
                            errObj.data.moduleName = requireModuleName;
                            errObj.data.version = moduleVersion;
                            reject(errObj);
                        }
                    });
                }                
            }
            catch (errTry) {
                let errObj = {};
                errObj.code = -32000;
                errObj.message = errTry.message;
                errObj.data = {};
                errObj.data.moduleName = requireModuleName;
                errObj.data.version = moduleVersion;
                reject(errObj);
            }
        });
    };

    this.requireSync = function(requireModuleName, moduleVersion, fileName){
        var code = null;
        var packageObj = null;
        var mainFile = null;
        var versionTarget = null;
        var moduleName = parseModuleName(requireModuleName);

        fileName = fileName || "";
        
        //cache
        var objResult = this.getObjectInCache(requireModuleName, moduleVersion, fileName);
        if (objResult){
            return objResult;
        }

        //circular reference
        var keyModuleName = moduleName + "_" + moduleVersion + "_" + fileName;
        if (listCurrentModulesCompile[keyModuleName]){
            log.warn(__filename, "requireSync", {key:keyModuleName, message:"circular reference"});
            return {};
        }
        
        var ext = path.parse(fileName).ext;

        if (ext === ""){
            mainFile = "";
            if (fileName){
                mainFile = fileName + ".js";
                code = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, mainFile);
            }
            if (code === null){
                var codePackage = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, fileName + "/package.json");
        
                if (codePackage === null){
                    mainFile = fileName + "/index.js";
                }
                else{
                    packageObj = JSON.parse(codePackage);

                    Object.freeze(packageObj); //security

                    //real absolute version
                    versionTarget = packageObj.version;

                    if (packageObj.main){
                        if (fileName){
                            mainFile = fileName + "/" + (packageObj.main || "index.js");
                        }
                        else{
                            mainFile = (packageObj.main || "index.js");
                        }                        
                    }
                    else{
                        mainFile = requireModuleName.substring(moduleName.length);
                        if (mainFile === ""){
                            mainFile = "index.js";
                        }
                    }

                    if (mainFile.indexOf(".js") === -1){
                        mainFile += ".js";
                    }

                    if (fileName === ""){ //require module, add packageObj in cache
                        this.addObjectInCache(requireModuleName, versionTarget, "package.json", packageObj);
                    }
                }
        
                code = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, mainFile);
            }
        }
        else{
            code = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, fileName);
        }

        if (code){
            if ((ext === ".js") || (ext === "")){
                var opt = {};
                opt.name = requireModuleName;
                opt.version = moduleVersion;
                opt.filePath = mainFile || fileName;
                
                try {
                    listCurrentModulesCompile[keyModuleName] = true;
                    var moduleResult = this.moduleCompile.compile(code, opt);
                    delete listCurrentModulesCompile[keyModuleName];
                }
                catch (errTry) {
                    listCurrentModulesCompile = {}; //important! clear
                    log.error(__filename, "compile", {key:keyModuleName, message:errTry.toString()});
                    throw errTry;
                }
                
                if (moduleResult.exports){
                    moduleResult.exports.__manifest = {};
                    moduleResult.exports.__manifest.name = opt.name;
                    moduleResult.exports.__manifest.version = opt.version;
                    moduleResult.exports.__manifest.filePath = opt.filePath;
                    moduleResult.exports.__manifest.packageObj = packageObj;
                    moduleResult.exports.__manifest.input = moduleResult.input || null;
                    moduleResult.exports.__manifest.output = moduleResult.output || null;
                    moduleResult.exports.__manifest.dispose = moduleResult.dispose || null;
                    if (moduleResult.config){
                        moduleResult.exports.__manifest.config = this.moduleConfig(moduleName, moduleVersion, moduleResult.config);
                    }
                    else{
                        moduleResult.config = null;
                    }
                    
                    Object.freeze(moduleResult.exports.__manifest); //security

                    this.addObjectInCache(requireModuleName, versionTarget || moduleVersion, fileName, moduleResult.exports);
    
                    return moduleResult.exports;
                }
                else{
                    return null;
                }
            }
            else if (ext === ".json"){
                var jsonResult = JSON.parse(code);
                if (jsonResult){
                    this.addObjectInCache(requireModuleName, versionTarget || moduleVersion, fileName, jsonResult);
    
                    return jsonResult;
                }
                else{
                    return null;
                }
            }
            else{
                return code;
            }
        }
        else{
            log.warn(__filename, "requireSync", {key:keyModuleName, message:"not found"});
            return code;
        }
    };
};

module.exports = ModuleFactory;