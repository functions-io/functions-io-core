"use strict";

const log = require("./log");
const path = require("path");
const ModuleCompile = require("./ModuleCompile");
const ModuleCache = require("./ModuleCache");
const onlyLettersRegex = /^[A-Za-z]+$/;


var ModuleFactory = function(p_memoryRegistry){
    var self = this;
    var listCurrentModulesCompile = {};

    this.moduleCompile = new ModuleCompile();
    this.moduleCache = new ModuleCache();
    this.moduleConfig = require("./moduleConfig");
    this.memoryRegistry = p_memoryRegistry;

    this.moduleCompile.requireModuleExtend = function(requirePath, manifest){
        //try search module defined in package.json
        var packageObj = self.requireSync(manifest.moduleName, manifest.moduleVersion, "package.json");

        if ((packageObj) && (packageObj.dependencies) && (packageObj.dependencies[requirePath])){
            let fileNameVersion = packageObj.dependencies[requirePath];

            return self.requireSync(requirePath, fileNameVersion);
        }

        if (requirePath.match(onlyLettersRegex)){
            //native require
            return require(requirePath);
        }
        else{
            var absoluteFileName = path.join(path.dirname(manifest.filePath), requirePath);
            return self.requireSync(manifest.moduleName, manifest.moduleVersion, absoluteFileName, manifest);
        }
    };

    this.requireAsync = function(moduleName, moduleVersion){
        return new Promise(function(resolve, reject){
            try {
                var objResult = self.moduleCache.getObjectInCache(moduleName, moduleVersion);
                if (objResult){
                    resolve(objResult);
                }
                else{
                    self.memoryRegistry.getDataStore(moduleName, moduleVersion, function(err, buffer, versionTarget){
                        try {
                            if (err){
                                reject(err);
                            }
                            else{
                                objResult = self.requireSync(moduleName, versionTarget);
        
                                if (objResult){
                                    resolve(objResult);
                                }
                                else{
                                    let errObj = {};
                                    errObj.code = -32601;
                                    errObj.message = "Module not found";
                                    errObj.data = {};
                                    errObj.data.moduleName = moduleName;
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
                            errObj.data.moduleName = moduleName;
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
                errObj.data.moduleName = moduleName;
                errObj.data.version = moduleVersion;
                reject(errObj);
            }
        });
    };

    this.getFileObjectInCache = function(moduleName, moduleVersion, fileName){
        var fileBuffer = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, fileName);
        
        if (fileBuffer){
            let manifest = {};
            manifest.size = fileBuffer.length || 0;
            manifest.filePath = fileName;
            if (fileName.indexOf(".json") > -1){
                let jsonObj = JSON.parse(fileBuffer);
                this.moduleCache.addObjectInCache(moduleName, moduleVersion, fileName, jsonObj, manifest);
                return jsonObj;
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    };

    this.requireSync = function(moduleName, moduleVersion, fileName, parentManifest){
        var code = null;
        var packageObj = null;
        var mainFile = null;
        var versionTarget = this.memoryRegistry.parseVersion(moduleName, moduleVersion);

        if (moduleVersion !== versionTarget){
            moduleVersion = versionTarget;
        }

        fileName = fileName || "";
        
        //cache
        var objResult = this.moduleCache.getObjectInCache(moduleName, moduleVersion, fileName);
        if (objResult){
            return objResult;
        }

        //circular reference
        var keyModuleName = moduleName + "_" + moduleVersion + "_" + fileName;
        if (listCurrentModulesCompile[keyModuleName]){
            if (parentManifest){
                log.warn(__filename, "requireSync", {key:keyModuleName, parent:parentManifest.filePath, message:"circular reference"});
            }
            else{
                log.warn(__filename, "requireSync", {key:keyModuleName, message:"circular reference"});
            }
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
                packageObj = this.getFileObjectInCache(moduleName, moduleVersion, fileName + "/package.json");
                
                if (packageObj){
                    Object.freeze(packageObj); //security

                    if (packageObj.version !== moduleVersion){
                        moduleVersion = packageObj.version || moduleVersion;
                    }
                    
                    if (packageObj.main){
                        if (fileName){
                            mainFile = fileName + "/" + (packageObj.main || "index.js");
                        }
                        else{
                            mainFile = (packageObj.main || "index.js");
                        }                        
                    }
                    else{
                        //**********???????????????///**********???????????????/// */**********???????????????/// */
                        //mainFile = moduleName.substring(moduleName.length);
                        if (mainFile === ""){
                            mainFile = "index.js";
                        }
                    }

                    if (mainFile.indexOf(".js") === -1){
                        mainFile += ".js";
                    }

                }
                else{
                    mainFile = fileName + "/index.js";
                }
        
                code = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, mainFile);
            }
        }
        else{
            code = this.memoryRegistry.getFileBufferInCache(moduleName, moduleVersion, fileName);
        }

        if (code){
            let manifest = {};
            manifest.moduleName = moduleName;
            manifest.moduleVersion = moduleVersion;
            manifest.size = code.length || 0;
            manifest.packageObj = packageObj;
            manifest.filePath = mainFile || fileName;
            manifest.input = this.getFileObjectInCache(moduleName, moduleVersion, "/input.json");
            manifest.output = this.getFileObjectInCache(moduleName, moduleVersion, "/output.json");

            if ((ext === ".js") || (ext === "")){
                try {
                    let timeStart = new Date().getTime();
                    listCurrentModulesCompile[keyModuleName] = true;
                    var moduleResult = this.moduleCompile.compile(code, manifest);
                    manifest.timeCompile = (new Date().getTime() - timeStart);
                    delete listCurrentModulesCompile[keyModuleName];
                }
                catch (errTry) {
                    listCurrentModulesCompile = {}; //important!!! clear
                    log.error(__filename, "compile", {key:keyModuleName, message:errTry.toString(), stack:errTry.stack});
                    throw errTry;
                }
                
                if (moduleResult.exports){
                    this.moduleCache.addObjectInCache(moduleName, moduleVersion, fileName, moduleResult.exports, manifest);
    
                    return moduleResult.exports;
                }
                else{
                    return moduleResult.exports;
                }
            }
            else if (ext === ".json"){
                var jsonResult = JSON.parse(code);
                if (jsonResult){
                    this.moduleCache.addObjectInCache(moduleName, moduleVersion, fileName, jsonResult, manifest);
    
                    return jsonResult;
                }
                else{
                    return null;
                }
            }
            else{
                this.moduleCache.addObjectInCache(moduleName, moduleVersion, fileName, code, manifest);
                return code;
            }
        }
        else{
            return code;
        }
    };
};

module.exports = ModuleFactory;