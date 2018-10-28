"use strict";

const log = require("./log");
const Config = require("./Config");

var InvokeFactory = function(p_moduleFactory){
    var self = this;
    
    this.moduleFactory = p_moduleFactory;

    this.config = new Config("functions");
    
    this.preFilter = function(moduleName, moduleVersion, data, context, callBack){
        callBack(null);
    };

    this.filter = function(data, context, callBack){
        callBack(null);
    };

    this.getDataSource = function(moduleName, moduleVersion, context, nameDataSource){
        return new Promise(function(resolve, reject){
            reject("DataSource not implemented. " + moduleName + moduleVersion + context + nameDataSource);
        });
    };

    this.route = function(moduleName, moduleVersion){
        return {moduleName:moduleName, moduleVersion:moduleVersion};
    };

    this.buildContext = function(parentContext, moduleName, moduleVersion){
        var context = {};

        if (parentContext){
            context.levelCall = (parentContext.levelCall || 0) + 1;
            context.security = parentContext.security;
            context.client = parentContext.client;
        }
        else{
            context.levelCall = 0;
        }
        context.moduleName = moduleName;
        context.moduleVersion = moduleVersion;
        context.getConfig = function(key, defaultValue){
            if (self.config){
                let value;
                if (key){
                    value = self.config.get(moduleName + ".config." + key, defaultValue);
                }
                else{
                    value = self.config.get(moduleName + ".config", defaultValue);
                }
                if (value === null){
                    let scopeName = "default";
                    if (moduleName.substring(0,1) === "@"){
                        scopeName = moduleName.substring(1,moduleName.indexOf("/"));
                    }
                    value = self.config.get(scopeName + "." + key, defaultValue);
                    if (value === null){
                        return self.config.get(key, defaultValue);
                    }
                    else{
                        return value;
                    }
                }
                else{
                    return value;
                }
            }
            else{
                return null;
            }
        };

        context.invokeAsync = function(internalInvokeModuleName, internalInvokeModuleVersion, internalInvokeData){
            return self.invokeAsync(internalInvokeModuleName, internalInvokeModuleVersion, internalInvokeData, context);
        };
        context.getDataSource = function(nameDataSource){
            return self.getDataSource(moduleName, moduleVersion, context, nameDataSource);
        };
        context.getManifestAsync = function(internalInvokeModuleName, internalInvokeModuleVersion){
            return self.getManifestAsync(internalInvokeModuleName, internalInvokeModuleVersion);
        };
        context.log = function(level, message){
            log.generic(level, "functions", moduleName, message, context);
        };
        if (parentContext && parentContext.moduleName){
            context.parentContext = {};
            context.parentContext.moduleName = parentContext.moduleName;
            context.parentContext.moduleVersion = parentContext.moduleVersion;
            
            Object.freeze(context.parentContext);
        }
        else{
            context.parentContext = null;
        }

        return context;
    };

    this.invokeAsync = function(moduleName, moduleVersion, data, context){
        try {
            let routeModule = this.route(moduleName, moduleVersion, context);
            if (routeModule){
                moduleName = routeModule.moduleName;
                moduleVersion = routeModule.moduleVersion;
            }
        }
        catch (errTryRoute) {
            log.error(__filename, "route", errTryRoute);
        }

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
                                    
                                    Object.freeze(context); //security

                                    if (typeof(moduleObj)  === "function"){
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
                                    let errObj = {};
                                    errObj.data = {};
                                    errObj.data.moduleName = moduleName;
                                    errObj.data.moduleVersion = moduleVersion;
                                    errObj.message = errTry3;
                                    log.error(__filename, "invokeAsync", errObj);
                                    reject(errObj);
                                }
                            },function(err){
                                let errObj = {};
                                errObj.data = {};
                                errObj.data.moduleName = moduleName;
                                errObj.data.moduleVersion = moduleVersion;
                                errObj.message = err;
                                if (typeof(err) === "number"){
                                    errObj.code = err;
                                }
                                log.error(__filename, "invokeAsync", errObj);
                                reject(errObj);
                            });
                        }                        
                    }
                    catch (errTry2) {
                        let errObj = {};
                        errObj.data = {};
                        errObj.data.moduleName = moduleName;
                        errObj.data.moduleVersion = moduleVersion;
                        errObj.message = errTry2;
                        log.error(__filename, "invokeAsync", errObj);
                        reject(errObj);
                    }
                });                
            }
            catch (errTry) {
                let errObj = {};
                errObj.data = {};
                errObj.data.moduleName = moduleName;
                errObj.data.moduleVersion = moduleVersion;
                errObj.message = errTry;
                log.error(__filename, "invokeAsync", errObj);
                reject(errObj);
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