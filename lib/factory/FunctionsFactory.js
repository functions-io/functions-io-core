"use strict";

var FunctionsCompile = require("./FunctionsCompile");
var FileExtension = require("./extension/FileExtension");
var EventEmitter = require("../EventAsync");

var FunctionsFactory = function(){
    var self = this;

    this.configFunctions = {};
    this.listFunctionManager = {};
    this.listFunctionManagerByFile = {};
    this.fileExtension = new FileExtension(this);
    this.functionsCompile = new FunctionsCompile();
    this.events = new EventEmitter();

    //
    //addFunctionManager
    //
    this.addFunctionManagerFromFolder = function(basePATH, callBack){
        this.fileExtension.addFunctionManagerFromFolder(basePATH, callBack);
    };

    this.addFunctionManagerFromFolderModules = function(callBack){
        this.fileExtension.addFunctionManagerFromFolderModules(callBack);
    };

    this.addFunctionManagerFromPackageFiles = function(files, callBack){
        this.fileExtension.addFunctionManagerFromPackageFiles(files, callBack);
    };

    this.addFunctionManagerFromPackageFile = function(filePackage, callBack){
        this.fileExtension.addFunctionManagerFromPackageFile(filePackage, callBack);
    };

    this.addFunctionManagerFromCode = function(code, opt, callBack){
        try{
            this.addFunctionManager(this.buildFunctionManagerFromCode(code, opt), function(err, functionManager){
                if (callBack){
                    if (err){
                        callBack(err);
                    }
                    else{
                        if (functionManager){
                            callBack(null, functionManager);
                        }
                        else{
                            callBack("Function " + opt.file + " Not Found");
                        }
                    }
                }
            });
        }
        catch(errAddFunction){
            if (callBack){
                callBack("Err load function " + opt.file + ": " + errAddFunction.stack);
            }
        }
    };

    this.addFunctionManager = function(functionManager, callBack){
        if (functionManager){
            var eventData = {};
            //warning modify - getFunctionManager
            functionManager.key = functionManager.stage + "-" + functionManager.name + "-" + functionManager.version;
            eventData.functionManager = functionManager;
            this.events.emit("PRE_LOAD_FUNCTION", eventData, function(errPreLoadFunction){
                if (errPreLoadFunction){
                    callBack(errPreLoadFunction);
                }
                else{
                    var itemManager = self.listFunctionManager[functionManager.name];
                    if (itemManager === undefined){
                        itemManager = {};
                        itemManager.listStages = {};
                        self.listFunctionManager[functionManager.name] = itemManager;
                    }

                    var itemStage = itemManager.listStages[functionManager.stage];
                    if (itemStage === undefined){
                        itemStage = {};
                        itemStage.listVersions = {};
                        itemStage._lastVersion = null;
                        itemManager.listStages[functionManager.stage] = itemStage;
                    }

                    itemStage.listVersions[functionManager.version] = functionManager;
                    
                    self.listFunctionManagerByFile[functionManager.file] = functionManager;
                    self.listFunctionManagerByFile[functionManager.fileMain] = functionManager;
                    
                    if ((itemStage._lastVersion === null) || (functionManager.version > itemStage._lastVersion)){
                        itemStage._lastVersion = functionManager.version;
                    }

                    callBack(null, functionManager);
                }
            });
        }
        else{
            callBack(null, null);
        }
    };


    //
    //removeFunctionManager
    //
    this.removeFunctionManager = function(stage, name, version){
        if ((stage === undefined) || (stage === null)){
            stage = "";
        }
        if (!(name)){
            throw new RangeError("Parameter required");
        }
        if ((version === undefined) || (version === null)){
            version = "";
        }

        var key = stage + "-" + name + "-" + version;
        var itemManager = this.listFunctionManager[name];

        if (itemManager){
            var itemStage = itemManager.listStages[stage];
            if (itemStage){
                var functionManager = itemStage.listVersions[version];
                if (functionManager){
                    delete itemStage.listVersions[version];
                    delete this.listFunctionManagerByFile[functionManager.file];
                    delete this.listFunctionManagerByFile[functionManager.fileMain];
                    functionManager = null;
                    itemStage._lastVersion = null;
                    var keys = Object.keys(this.listFunctionManagerByFile);
                    for (var i = 0; i < itemStage.listVersions.length; i++){
                        if ((itemStage._lastVersion === null) || (itemStage.listVersions[keys[i]].version < itemStage._lastVersion)){
                            itemStage._lastVersion = itemStage.listVersions[keys[i]].version;
                        }
                    }

                    this.events.emit("POS_UNLOAD_FUNCTION", eventData, function(errPosUnloadFunction){
                        
                    });

                    return true;
                }
            }
        }

        return false;
    };

    this.removeFunctionManagerFromFileName = function(file){
        var item = this.listFunctionManagerByFile[file];
        
        if (item){
            return this.removeFunctionManager(item.stage, item.name, item.version);
        }

        return false;
    };

    this.buildFunctionManagerFromCode = function(code, opt){
        return this.buildFunctionManager(this.functionsCompile.compile(code, opt), opt);
    };

    //
    //getFunctionManager
    //
    this.getFunctionManager = function(stage, name, version){
        var functionManager;
        
        if ((stage === undefined) || (stage === null)){
            stage = "";
        }
        if (!(name)){
            throw new RangeError("Parameter required");
        }
        if ((version === undefined) || (version === null)){
            version = "";
        }

        var itemManager = this.listFunctionManager[name];

        if (itemManager){
            var itemStage = itemManager.listStages[stage];
            if (itemStage){
                var functionManager = itemStage.listVersions[version || itemStage._lastVersion];

                if (functionManager === undefined){
                    return null;
                }
                else{
                    return functionManager;
                }
            }
        }

        return null;
    };

    //
    //buildFunctionManager
    //
    this.buildFunctionManager = function(moduleInstance, opt){
        var functionManager;

        functionManager = {};
        
        functionManager.module = moduleInstance;

        if (functionManager.module.returnType){
            functionManager.returnType = functionManager.module.returnType;
        }
        else{
            functionManager.returnType = null;
        }

        functionManager.info = opt; //opt.file, opt.fileMain, opt.fileTest

        //stage
        functionManager.stage = opt.package.stage || "";
        
        //name
        if (opt.package.name){
            functionManager.name = opt.package.name;
        }
        else{
            throw new RangeError("Parameter name required");
        }
        
        //version
        functionManager.version = opt.package.version || "";

        //category
        functionManager.category = opt.package.category || "";

        //description
        functionManager.description = opt.package.description || "";

        //config
        if ((this.configFunctions) && (this.configFunctions[functionManager.name])){
            functionManager.module.config = this.configFunctions[functionManager.name];
        }

        functionManager.module._factory = self;
        
        return functionManager;
    };
};

module.exports = FunctionsFactory;