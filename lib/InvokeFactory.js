"use strict";

const log = require("./log");

var InvokeFactory = function(p_moduleFactory){
    var self = this;

    this.moduleFactory = p_moduleFactory;
    
    this.preFilter = function(moduleName, moduleVersion, data, context, callBack){
        callBack(null);
    };

    this.filter = function(data, context, callBack){
        callBack(null);
    };
    
    this.buildContext = function(context, moduleName, moduleVersion){
        if (!context){
            context = {};
        }
        if (context.invokeAsync === undefined){
            context.invokeAsync = function(internalInvokeModuleName, internalInvokeModuleVersion, internalInvokeData){
                return self.invokeAsync(internalInvokeModuleName, internalInvokeModuleVersion, internalInvokeData, context);
            };
        }
        if (context.getManifestAsync === undefined){
            context.getManifestAsync = function(internalInvokeModuleName, internalInvokeModuleVersion){
                return self.getManifestAsync(internalInvokeModuleName, internalInvokeModuleVersion);
            };
        }
        if (context.log === undefined){
            context.log = function(level, message){
                log.generic(level, "functions", moduleName, message, context);
            };
        }
        if (context.listModulesInvoked === undefined){
            context.listModulesInvoked = [];
        }
        if (moduleName){
            context.listModulesInvoked.push({moduleName: moduleName, moduleVersion: moduleVersion || ""});
        }
        return context;
    };

    this.invokeAsync = function(moduleName, moduleVersion, data, context){
        return new Promise(function(resolve, reject){
            try {
                context = self.buildContext(context, moduleName, moduleVersion);
                self.preFilter(moduleName, moduleVersion, data, context, function(errPreFilter){
                    try {
                        if (errPreFilter){
                            reject(errPreFilter);
                        }
                        else{
                            self.moduleFactory.requireAsync(moduleName, moduleVersion).then(function(moduleObj){
                                try {
                                    context.manifestObj = self.moduleFactory.getManifestSync(moduleName, moduleVersion);
                                    if (moduleObj instanceof Function){
                                        self.filter(data, context, function(errFilter){
                                            try {
                                                if (errFilter){
                                                    reject(errFilter);
                                                }
                                                else{
                                                    //invoke module
                                                    let objResult;
                                                    
                                                    if (Array.isArray(data)){
                                                        let args = data.slice();
                                                        args.push(context);
                                                        if (moduleObj.length <= args.length){
                                                            objResult = moduleObj.apply(this, args);
                                                        }
                                                        else{
                                                            let errObj = {};
                                                            errObj.code = -32602; //Invalid params
                                                            errObj.message = "Invalid signature";
                                                            reject(errObj);
                                                            return;
                                                        }
                                                    }
                                                    else{
                                                        if (data instanceof Object){
                                                            if (moduleObj.length <= 2){
                                                                objResult = moduleObj(data, context);
                                                            }
                                                            else{
                                                                let errObj = {};
                                                                errObj.code = -32602; //Invalid params
                                                                errObj.message = "Invalid signature";
                                                                reject(errObj);
                                                                return;
                                                            }
                                                        }
                                                        else{
                                                            let args = [];
                                                            args.push(data);
                                                            args.push(context);
                            
                                                            if (moduleObj.length <= args.length){
                                                                objResult = moduleObj.apply(this, args);
                                                            }
                                                            else{
                                                                let errObj = {};
                                                                errObj.code = -32602; //Invalid params
                                                                errObj.message = "Invalid signature";
                                                                reject(errObj);
                                                                return;
                                                            }
                                                        }
                                                    }
                            
                                                    if (objResult instanceof Promise){
                                                        objResult.then(function(objResult2){
                                                            resolve(objResult2);
                                                        },function(err2){
                                                            reject(err2);
                                                        });
                                                    }
                                                    else{
                                                        resolve(objResult);
                                                    }
                                                }                                            
                                            }
                                            catch (errTry4) {
                                                log.error(__filename, "invokeAsync", errTry4);
                                                reject(errTry4);
                                            }
                                        });
                                    }
                                    else{
                                        let errObj = {};
                                        errObj.message = "Not function";
                                        errObj.data = {};
                                        errObj.data.moduleName = moduleName;
                                        errObj.data.moduleVersion = moduleVersion;
                                        log.error(__filename, "invokeAsync", errObj);
                                        reject(errObj);
                                    }
                                }
                                catch (errTry3) {
                                    log.error(__filename, "invokeAsync", errTry3);
                                    reject(errTry3);
                                }
                            },function(err){
                                log.error(__filename, "invokeAsync", err);
                                reject(err);
                            });
                        }                        
                    }
                    catch (errTry2) {
                        log.error(__filename, "invokeAsync", errTry2);
                        reject(errTry2);
                    }
                });                
            }
            catch (errTry) {
                log.error(__filename, "invokeAsync", errTry);
                reject(errTry);
            }
        });
    };

    this.invokeMessage = function(messageInput, callBack){
        let messageResponse = {};
        messageResponse.jsonrpc = "2.0";
        messageResponse.id = messageInput.id || null;

        try {
            let moduleName;
            let moduleVersion = messageInput.version || "*";
            let context = messageInput.context;
            if (messageInput.scope){
                moduleName = "@" + messageInput.scope + "/" + messageInput.method;
            }
            else{
                moduleName = messageInput.method;
            }
    
            //{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": 1}
            //{"jsonrpc": "2.0", "result": 19, "id": 1}
            //{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
            this.invokeAsync(moduleName, moduleVersion, messageInput.params, context)
                .then(function(dataResponse){
                    messageResponse.result = dataResponse;
                    callBack(null, messageResponse);
                }
                ,function(errInvoke){
                    if (errInvoke instanceof Object){
                        messageResponse.error = errInvoke;
                    }
                    else{
                        messageResponse.error = {};
                        messageResponse.error.code = -32000;
                        messageResponse.error.message = errInvoke;
                    }
                    callBack(null, messageResponse);
                });
        }
        catch (error){
            log.error(__filename, "invokeMessage", error);
            messageResponse.error = {};
            messageResponse.error.code = -32000;
            messageResponse.error.message = error;
            callBack(null, messageResponse);
        }
    };

    this.getManifestAsync = function(moduleName, moduleVersion){
        return this.moduleFactory.getManifestAsync(moduleName, moduleVersion);
    };
};

module.exports = InvokeFactory;