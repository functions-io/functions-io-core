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
                            args.push(context);
                            objResult = moduleObj.apply(this, args);
                        }
                        else{
                            objResult = moduleObj(data, context);
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
        /*
        message.type
        message.context
        message.context.http
        message.context.security
        message.context.client
        message.id
        message.name
        message.version
        message.scope
        message.data
        */
        
        let messageResponse = {};
        messageResponse.jsonrpc = messageInput.jsonrpc;
        messageResponse.id = messageInput.id;

        try {
            let moduleName;
            let context = messageInput.context;
            if (messageInput.scope){
                moduleName = "@" + messageInput.scope + "/" + messageInput.name;
            }
            else{
                moduleName = messageInput.name;
            }
    
            //{"jsonrpc": "2.0", "result": 19, "id": 1}
            //{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}

            this.invokeAsync(moduleName, messageInput.version, messageInput.data, context)
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