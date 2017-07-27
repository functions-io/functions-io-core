"use strict";

//Events: PRE_INVOKE | POS_INVOKE

var FunctionsFactory = require("./factory/FunctionsFactory");
var EventEmitter = require("./EventAsync");

var FunctionsInvoke = function(){
    var self = this;

    this.functionsFactory = new FunctionsFactory();
    this.events = this.functionsFactory.events;
    this.global = {};

    var functionContextInvoke = function(stage, name, version, dataInvoke, callBackInvoke){
        self.invoke(stage, name, version, dataInvoke, context, callBackInvoke);
    }

    var functionAddListener = function(eventName, listener){
        self.events.on(eventName, listener);
    }

    this.loadFunctions = function(path, callBack){
        this.functionsFactory.addFunctionManagerFromFolderModules(function(err, result){
            if (err){
                callBack(err);
            }
            else{
                if (path){
                    self.functionsFactory.addFunctionManagerFromFolder(path, callBack);
                }
                else{
                    callBack(null);
                }
            }
        });
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
        
        if (!(functionName)){
            throw new RangeError("Parameter functionName required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }

        functionManager = this.functionsFactory.getFunctionManager(functionStage, functionName, functionVersion);

        if (functionManager){
            var eventData;
            
            if ((context === undefined) || (context === null)){
                context = {};
            }
            if ((context.header === undefined) || (context.header === null)){
                context.header = {};
            }
            if (context.invoke === undefined){
                context.invoke = functionContextInvoke;
            }
            if (context.on === undefined){
                context.on = functionAddListener;
            }

            eventData = {};
            eventData.context = context;
            eventData.message = message;
            eventData.functionManager = functionManager;
            eventData.functionStage = functionStage;
            eventData.functionName = functionName;
            eventData.functionVersion = functionVersion;

            this.events.emit("PRE_INVOKE", eventData, function(errPreInvoke){
                try{
                    if (errPreInvoke){
                        if (errPreInvoke.name === undefined){
                            errPreInvoke.name = functionManager.module.category;
                        }
                        errPreInvoke.category = functionManager.module.category;
                        errPreInvoke.origin = functionManager.name;

                        callBack(errPreInvoke);
                    }
                    else{
                        message = eventData.message; //Some event may have changed

                        functionManager.module.exports(context, message, function(errFunc, dataFunc){
                            try{
                                eventData.resultErr = errFunc;
                                eventData.resultData = dataFunc;

                                self.events.emit("POS_INVOKE", eventData, function(errPosInvoke){
                                    try{
                                        if (errPosInvoke){
                                            if (errPosInvoke.name === undefined){
                                                errPosInvoke.name = functionManager.module.category;
                                            }
                                            errPosInvoke.category = functionManager.module.category;
                                            errPosInvoke.origin = functionManager.name;

                                            callBack(errPosInvoke);
                                        }
                                        else{
                                            callBack(errFunc, dataFunc);
                                        }
                                    }
                                    catch (err){
                                        callBack(err);
                                    }
                                });
                            }
                            catch (err){
                                callBack(err);
                            }
                        });
                    }
                }
                catch (err){
                    callBack(err);
                }
            });
        }
        else{
            throw new ReferenceError("Function not found: " + functionStage + "-" + functionName + ":" + functionVersion);
        }
    };
};

module.exports = FunctionsInvoke;