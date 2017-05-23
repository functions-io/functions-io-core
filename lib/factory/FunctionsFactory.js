"use strict";

var vm = require("vm");
var InputValidate = require("./InputValidate");
var Security = require("./Security");
var functionUnitTest = require("./functionsUnitTest");
var FileExtension = require("./extension/FileExtension");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsFactory = function(){
    this.global = {};
    this.enableStatistics = true;
    this.enableSecurity = false;
    this.configFunctions = {};
    this.listFunctionManager = {};
    this.listFunctionManagerByFile = {};
    this.inputValidate = new InputValidate();
    this.security = new Security();
    this.extension = {};
    this.beforeInvoke = null;
    this.afterInvoke = null;

    var self = this;

    this.extension.file = new FileExtension(this);

    this.addFunctionManagerFromCode = function(code, opt, callBack){
        try{
            var functionManager = this.addFunctionManager(this.buildFunctionManagerFromCode(code, opt));
            if (callBack){
                if (functionManager){
                    callBack(null, functionManager.key);
                }
                else{
                    console.error("Function " + opt.file + " Not Found");
                    callBack("Function " + opt.file + " Not Found");
                }
            }
        }
        catch(errAddFunction){
            var messageErr;

            if (errAddFunction.stack){
                messageErr = errAddFunction.stack.substring(0,errAddFunction.stack.indexOf("at"));
            }
            else{
                messageErr = errAddFunction.message;
            }
            
            //console.error("Err load function " + opt.file + ": " + messageErr);
            console.error("Err load function " + opt.file + ": " + errAddFunction.stack);
            callBack(messageErr);
        }
    };

    this.addFunctionManager = function(functionManager){
        if (functionManager){
            //warning modify - getFunctionManager
            functionManager.key = functionManager.stage + "-" + functionManager.name + "-" + functionManager.version;
            
            var itemManager = this.listFunctionManager[functionManager.name];
            if (itemManager === undefined){
                itemManager = {};
                itemManager.listStages = {};
                itemManager.listStages._lastVersion = null;
                this.listFunctionManager[functionManager.name] = itemManager;
            }

            var itemStage = itemManager.listStages[functionManager.stage];
            if (itemStage === undefined){
                itemStage = {};
                itemStage.listVersions = {};
                itemManager.listStages[functionManager.stage] = itemStage;
            }

            itemStage.listVersions[functionManager.version] = functionManager;
            
            if (functionManager.stage !== "_test"){
                this.listFunctionManagerByFile[functionManager.file] = functionManager;
                this.listFunctionManagerByFile[functionManager.fileMain] = functionManager;
                if (functionManager.fileTest){
                    this.listFunctionManagerByFile[functionManager.fileTest] = functionManager;
                }
                if ((itemManager.listStages._lastVersion === null) || (functionManager.version > itemManager.listStages._lastVersion)){
                    itemManager.listStages._oldLastVersion = itemManager.listStages._lastVersion;
                    itemManager.listStages._lastVersion = functionManager.version;
                }
            }
            
            console.info("Function " + functionManager.key + " loaded");

            return functionManager;
        }
        else{
            return null;
        }
    };

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
                var functionManager = itemStage.listVersions[version || itemManager.listStages._lastVersion];

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
            var itemStageTest = itemManager.listStages["_test"];
            if (itemStageTest){
                if (itemStageTest.listVersions[version]){
                    delete itemStageTest.listVersions[version];
                    console.info("Function _test" + "-" + name + "-" + version + " removed");
                }
            }

            var itemStage = itemManager.listStages[stage];
            if (itemStage){
                var functionManager = itemStage.listVersions[version];
                if (functionManager){
                    delete itemStage.listVersions[version];
                    delete this.listFunctionManagerByFile[functionManager.file];
                    delete this.listFunctionManagerByFile[functionManager.fileMain];
                    if (functionManager.fileTest){
                        delete this.listFunctionManagerByFile[functionManager.fileTest];
                    }
                    functionManager = null;
                    itemManager.listStages._lastVersion = itemManager.listStages._oldLastVersion;

                    console.info("Function " + key + " removed");

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
        return this.buildFunctionManager(this.compile(code, opt), opt);
    };

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

        functionManager.file = opt.file;
        functionManager.fileMain = opt.fileMain;
        functionManager.fileTest = opt.fileTest;

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

        //test
        if (functionManager.module.test){
            functionManager.stage = "_test";
            functionManager.module.category = "test";
            functionManager.summary = "Test";
            functionManager.module.exports = functionUnitTest;
        }
        else{
            //exports
            if (!(functionManager.module.exports)){
                console.erro("Export required - " + functionManager.name);
                return null;
            }
        }

        //config
        if ((this.configFunctions) && (this.configFunctions[functionManager.name])){
            functionManager.module.config = this.configFunctions[functionManager.name];
        }

        functionManager.module._factory = self;
        
        functionManager.hits = {};
        functionManager.hits.success = 0;
        functionManager.hits.error = 0;
        functionManager.hits.abort = 0;
        functionManager.hits.lastResponseTime = 0;
        functionManager.hits.avgResponseTime = 0;
        functionManager.hits.maxResponseTime = 0;
        functionManager.hits.minResponseTime = 0;

        return functionManager;
    };

    this.compile = function(code, opt){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        var name = "functions";
        var filePATH = "functions";

        if (opt){
            if (opt.name){
                name = opt.name;
            }
            if (opt.file){
                filePATH = opt.fileMain || opt.file;
            }
        }

        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: filePATH,
            lineOffset: 0,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};

        var newRequire = function(path){
            if (path.substring(0,1) === "/"){
                if (opt.basePATH){
                    path = opt.basePATH + "/" + path;
                }
            }
            else if (path.substring(0,2) === "./"){
                if (opt.dirPATH){
                    path = opt.dirPATH + "/" + path.substring(2);
                }
            }
            return require(path);
        }

        compiledWrapper(newModule.exports, newRequire, newModule, name, filePATH);

        return newModule;
    };

    this.invokeMessage = function(messageRequest, callBack){
        this.invoke(messageRequest.stage, messageRequest.method, messageRequest.version, messageRequest.params, {global:this.global, header: messageRequest.header}, function(errInvoke, resultInvoke, functionManager){
            var messageResponse = {};
            
            messageResponse.id = messageRequest.id;
            
            if (errInvoke){
                messageResponse.error = errInvoke;
            }
            else{
                messageResponse.result = resultInvoke;
            }

            callBack(messageResponse, functionManager);
        });
    };

    this.invoke = function(functionStage, functionName, functionVersion, message, context, callBack){
        var functionManager;
        var validateResult;
        var diffTime = 0;
        var start = 0;

        if (this.enableStatistics){
            start = process.hrtime();
        }
        
        if (!(functionName)){
            throw new RangeError("Parameter functionName required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }
        
        functionManager = this.getFunctionManager(functionStage, functionName, functionVersion);

        if (functionManager){
            var callBackWrapper = function(errWrapper, dataWrapper){
                if (self.afterInvoke){
                    self.afterInvoke(functionManager, errWrapper, dataWrapper, callBack);
                }
                else{
                    callBack(errWrapper, dataWrapper, functionManager);
                }
            }

            if ((context === undefined) || (context === null)){
                context = {};
            }
            if ((context.header === undefined) || (context.header === null)){
                context.header = {};
            }
            if ((context.security === undefined) || (context.security === null)){
                context.security = {};
            }
            if ((context.security.acessToken === undefined) || (context.security.acessToken === null)){
                context.security.acessToken = "";
            }
            if (context.security.user === undefined){
                context.security.user = null;
            }
            if ((context.infoCall === undefined) || (context.infoCall === null)){
                context.infoCall = {};
                context.infoCall.list = [];
            }
            if (context.invoke === undefined){
                context.invoke = function(stage, name, version, dataInvoke, callBackInvoke){
                    self.invoke(stage, name, version, dataInvoke, context, callBackInvoke);
                }
            }
            
            if (Object.isFrozen(context) === false){
                Object.freeze(context);
            }

            context.infoCall.list.push({stage:functionStage, name:functionName, version:functionVersion});

            //call function
            var invoke = function(message, context){
                try {
                    validateResult = self.inputValidate.parse(functionManager.name, message, functionManager.module.input); //validate and parse
                    if (validateResult.error){
                        functionManager.hits.error ++;
                        callBackWrapper(validateResult.error);
                        return;
                    }
                    else{
                        message = validateResult.data; //message parsed
                    }
                    
                    functionManager.module.exports(context, message, function(errFunc, dataFunc){
                        if (errFunc){
                            if (errFunc.name === undefined){
                                errFunc.name = functionManager.module.category;
                            }
                            errFunc.category = functionManager.module.category;
                            errFunc.origin = functionManager.name;
                        }
                        if (self.enableStatistics){
                            diffTime = process.hrtime(start);
                            diffTime = ((diffTime[0] * 1e3) + (diffTime[1] / 1e6));
                            if (errFunc){
                                functionManager.hits.error ++;
                            }
                            else{
                                functionManager.hits.success ++;
                            }
                            if (functionManager.hits.lastResponseTime === 0){
                                functionManager.hits.avgResponseTime = diffTime;
                            }
                            else{
                                functionManager.hits.avgResponseTime = ((diffTime + functionManager.hits.lastResponseTime) / 2);
                            }
                            if (diffTime > functionManager.hits.maxResponseTime){
                                functionManager.hits.maxResponseTime = diffTime;
                            }
                            if ((functionManager.hits.minResponseTime === 0) || (diffTime < functionManager.hits.minResponseTime)){
                                functionManager.hits.minResponseTime = diffTime;
                            }
                            functionManager.hits.lastResponseTime = diffTime;
                        }

                        callBackWrapper(errFunc, dataFunc);
                    });
                } catch (errorCall) {
                    console.error(errorCall.message);
                    if (self.enableStatistics){
                        functionManager.hits.abort ++;
                    }
                    callBackWrapper(errorCall);
                }
            }

            var securityInvoke = function(message, context){
                try{
                    if (self.enableSecurity === false){
                        invoke(message, context);
                    }
                    else{
                        if ((functionManager.module.validatePermission !== undefined) && (functionManager.module.validatePermission === false)){
                            self.security.validateToken(context, function(errToken){
                                if (errToken){
                                    callBackWrapper(errToken);
                                }
                                else{
                                    invoke(message, context);
                                }
                            });
                        }
                        else{
                            self.security.validatePermission(context, functionManager.name, function(errPermission, resultPermission){
                                if (errPermission){
                                    callBackWrapper(errPermission);
                                }
                                else{
                                    invoke(message, context);
                                }
                            });
                        }
                    }
                }
                catch(errSecurity){
                    callBackWrapper(errSecurity);
                }
            }

            if (self.beforeInvoke){
                self.beforeInvoke(functionManager, message, context, function(newErr, newMessage, newContext){
                    if (newErr){
                        callBackWrapper(newErr);
                    }
                    else{
                        if (newMessage){
                            message = newMessage;
                        }
                        if (newContext){
                            context = newContext;
                        }
                        securityInvoke(message, context);
                    }
                })
            }
            else{
                securityInvoke(message, context);
            }
        }
        else{
            throw new ReferenceError("Function not found: " + functionStage + "-" + functionName + ":" + functionVersion);
        }
    };
};

module.exports = FunctionsFactory;