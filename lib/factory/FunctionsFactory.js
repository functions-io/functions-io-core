"use strict";

var vm = require("vm");
var InputValidate = require("./InputValidate");
var functionUnitTest = require("./functionsUnitTest");
var FileExtension = require("./extension/FileExtension");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsFactory = function(){
    this.isGenerateStatistics = true;
    this.listFunctionManager = {};
    this.inputValidate = new InputValidate();
    this.global = {};
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
            
            this.listFunctionManager[functionManager.key] = functionManager;

            console.info("Function " + functionManager.key + " loaded");

            return functionManager;
        }
        else{
            return null;
        }
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

        //stage
        if ((opt) && (opt.stage)){
            functionManager.stage = opt.stage;
        }
        else{
            if (functionManager.module.stage){
                functionManager.stage = functionManager.module.stage;
            }
            else{
                functionManager.stage = "";
            }
        }
        
        //name
        if (functionManager.module.name){
            functionManager.name = functionManager.module.name;
        }
        else{
            if ((opt) && (opt.name)){
                functionManager.name = opt.name;
            }
            else{
                throw new RangeError("Parameter name required");
            }
        }

        //version
        if (functionManager.module.version){
            functionManager.version = functionManager.module.version;
        }
        else{
            if ((opt) && (opt.version)){
                functionManager.version = opt.version;
            }
            else{
                functionManager.version = "";
            }
        }

        //test
        if (functionManager.module.test){
            functionManager.stage = "_unitTest";
            functionManager.module.category = "unitTest";
            functionManager.summary = "Unit Test";
            functionManager.module.exports = functionUnitTest;
        }
        else{
            //exports
            if (!(functionManager.module.exports)){
                console.erro("Export required - " + functionManager.name);
                return null;
            }
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
            if (opt.filePATH){
                filePATH = opt.filePATH;
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

    this.getFunctionManager = function(functionStage, functionName, functionVersion){
        var functionManager;
        
        if ((functionStage === undefined) || (functionStage === null)){
            functionStage = "";
        }
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }
        if ((functionVersion === undefined) || (functionVersion === null)){
            functionVersion = "";
        }

        //warning modify - addFunctionManager
        var key = functionStage + "-" + functionName + "-" + functionVersion;

        functionManager = this.listFunctionManager[key];
        if (functionManager === undefined){
            if (functionStage !== ""){
                functionManager = this.listFunctionManager["-" + functionName + "-" + functionVersion];
                if (functionManager === undefined){
                    return null;
                }
                else{
                    functionManager;
                }
            }
            else{
                return null;
            }
        }
        else{
            return functionManager;
        }
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
        var callBackWrapper;
        var validateResult;
        var diffTime = 0;
        var start = 0;

        if (this.isGenerateStatistics){
            start = process.hrtime();
        }
        
        if (!(functionName)){
            throw new RangeError("Parameter functionName required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }
        if ((context === undefined) || (context === null)){
            context = {};
        }

        functionManager = this.getFunctionManager(functionStage, functionName, functionVersion);

        callBackWrapper = function(errWrapper, dataWrapper){
            if (self.afterInvoke){
                self.afterInvoke(functionManager, errWrapper, dataWrapper, callBack);
            }
            else{
                callBack(errWrapper, dataWrapper, functionManager);
            }
        }

        if (functionManager){
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
                        if (self.isGenerateStatistics){
                            diffTime = (process.hrtime(start)[1] / 1000);
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
                    if (this.isGenerateStatistics){
                        functionManager.hits.abort ++;
                    }
                    callBackWrapper(errorCall);
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
                        invoke(message, context);
                    }
                })
            }
            else{
                invoke(message, context);
            }
        }
        else{
            throw new ReferenceError("Function not found");
        }
    };
};

module.exports = FunctionsFactory;