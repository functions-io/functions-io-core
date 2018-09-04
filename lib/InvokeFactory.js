"use strict";

const log = require("./log");

var InvokeFactory = function(p_moduleFactory){
    var self = this;

    this.moduleFactory = p_moduleFactory;
    
    this.validate = function(moduleObj, data, context, callBack){
        console.log("validate", moduleObj.__manifest, data, context);
        callBack(null);
    };

    this.invokeAsync = function(moduleName, moduleVersion, data, context){
        return new Promise(function(resolve, reject){
            self.moduleFactory.requireAsync(moduleName, moduleVersion).then(function(moduleObj){
                self.validate(moduleObj, data, context, function(errValidate){
                    if (errValidate){
                        reject(errValidate);
                    }
                    else{
                        //invoke module

                        let objResult;
                        
                        if (Array.isArray(data)){
                            let args = data.slice();
                            if (args.length === moduleObj.length){
                                args.push(context);
                                objResult = moduleObj.apply(this, args);
                            }
                            else{
                                reject(new Error("method invalid"));
                                return;
                            }
                        }
                        else{
                            if (data instanceof Object){
                                objResult = moduleObj(data, context);
                            }
                            else{
                                let args = [];
                                args.push(data);

                                if (args.length === moduleObj.length){
                                    args.push(context);
                                    objResult = moduleObj.apply(this, args);
                                }
                                else{
                                    reject(new Error("method invalid"));
                                    return;
                                }
                            }
                        }

                        if (objResult instanceof Promise){
                            objResult.then(function(objResult2){
                                resolve(objResult2);
                            }).catch(function(err2){
                                reject(err2);
                            });
                        }
                        else{
                            resolve(objResult);
                        }
                    }
                });
            }).catch(function(err){
                reject(err);
            });
        });
    };

    this.invokeMessage = function(messageInput, callBack){
        let messageResponse = {};
        messageResponse.jsonrpc = "2.0";
        messageResponse.id = messageInput.id || null;

        try {
            let moduleName;
            let moduleVersion = messageInput.version || null;
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
                })
                .catch(function(errInvoke){
                    if (errInvoke instanceof Object){
                        messageResponse.error = errInvoke;
                    }
                    else{
                        messageResponse.error = {};
                        messageResponse.error.code = -32000;
                        messageResponse.error.message = errInvoke;
                    }
                    messageResponse.error = {};
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
};

module.exports = InvokeFactory;