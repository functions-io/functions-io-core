"use strict";

var Security = function(){
    var self = this;

    this.validatePermission = function(context, permission, callBack){
        if (context === undefined){
            context = {};
        }
        if (context.header === undefined){
            context.header = {};
        }
        if (context.header.security === undefined){
            context.header.security = {};
        }
        if (context.header.security.acessToken === undefined){
            context.header.security.acessToken = "";
        }
        
        context.invoke(null, "sys.security.validateToken", null, {token:context.header.security.acessToken}, function(errValidateToken, resultValidateToken){
            if (errValidateToken){
                callBack(errValidateToken);
            }
            else{
                context.invoke(null, "sys.security.hasPermission", null, {user:resultValidateToken.user, permission:permission}, function(errValidatePermission, resultValidatePermission){
                    if (errValidatePermission){
                        callBack(errValidatePermission);
                    }
                    else{
                        context.header.security.user = resultValidateToken.user;
                        callBack(null, resultValidateToken.user);
                    }
                });
            }
        });
    };
};

module.exports = Security;