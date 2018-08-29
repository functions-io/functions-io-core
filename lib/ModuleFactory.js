"use strict";

const log = require("./log");
const path = require("path");
const ModuleCompile = require("./ModuleCompile");
const onlyLettersRegex = /^[A-Za-z]+$/;
const semver = require("semver");

var ModuleFactory = function(p_memoryRegistry){
    var self = this;

    this.cacheObjects = new Map();
    this.cacheModuleNameVersion = new Map();
    this.moduleCompile = new ModuleCompile();
    
    this.memoryRegistry = p_memoryRegistry;

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

    this.moduleCompile.requireModuleExtend = function(moduleName, moduleVersion, fileName, opt){
        //try search module defined in package.json
        var packageObj = self.requireSync(moduleName, moduleVersion, "package.json");
        if ((packageObj) && (packageObj.dependencies) && (packageObj.dependencies[fileName])){
            let fileNameVersion = packageObj.dependencies[fileName];

            return self.requireSync(fileName, fileNameVersion);
        }

        //native require
        if (fileName.match(onlyLettersRegex)){
            return require(fileName);
        }

        //opt fields: opt.name, opt.version, opt.filePath
        //internal module
        var absoluteFileName = path.join(path.dirname(opt.filePath), fileName);
        return self.requireSync(moduleName, moduleVersion, absoluteFileName);
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
                var mainCacheItem = {}
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
    }

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
    }

    this.requireAsync = function(moduleName, moduleVersion){
        return new Promise(function(resolve, reject){
            var objResult = self.getObjectInCache(moduleName, moduleVersion);
            if (objResult){
                resolve(objResult);
            }
            else{
                self.memoryRegistry.getDataStore(moduleName, moduleVersion, function(err, buffer, versionTarget){
                    if (err){
                        reject(err);
                    }
                    else{
                        objResult = self.requireSync(moduleName, moduleVersion);

                        if (objResult){
                            self.memoryRegistry.removeDataStoreInCache(moduleName, moduleVersion);

                            resolve(objResult);
                        }
                        else{
                            reject("module " + moduleName + ":" + moduleVersion + " not found");
                        }
                    }
                });
            }
        });
    }

    this.requireSync = function(moduleName, moduleVersion, fileName){
        var code = null;
        var packageObj = null;
        var mainFile = null;
        var versionTarget = null;
        
        fileName = fileName || "";
        
        //cache
        var objResult = this.getObjectInCache(moduleName, moduleVersion, fileName);
        if (objResult){
            return objResult;
        }

        var ext = path.parse(fileName).ext;

        if (ext === ""){
            var mainFile = "";
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

                    //real absolute version
                    versionTarget = packageObj.version;

                    if (fileName){
                        mainFile = fileName + "/" + (packageObj.main || "index.js");
                    }
                    else{
                        mainFile = (packageObj.main || "index.js");
                    }

                    if (mainFile.indexOf(".js") === -1){
                        mainFile += ".js";
                    }

                    if (fileName === ""){ //require module, add packageObj in cache
                        this.addObjectInCache(moduleName, versionTarget, "package.json", packageObj);
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
                opt.name = moduleName;
                opt.version = moduleVersion;
                opt.filePath = mainFile || fileName;
                var moduleResult = this.moduleCompile.compile(code, opt);
                if (moduleResult.exports){
                    this.addObjectInCache(moduleName, versionTarget || moduleVersion, fileName, moduleResult.exports);
    
                    return moduleResult.exports;
                }
                else{
                    return null;
                }
            }
            else if (ext === ".json"){
                var jsonResult = JSON.parse(code);
                if (jsonResult){
                    this.addObjectInCache(moduleName, versionTarget || moduleVersion, fileName, jsonResult);
    
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
            return code;
        }
    }
};

module.exports = ModuleFactory;