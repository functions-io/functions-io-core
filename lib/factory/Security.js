"use strict";

var Security = function(){
    this.validateToken = function(context, callBack){
        if (context.security.user){
            callBack(null, context.security.user);
        }
        else{
            context.invoke(null, "sys.security.token.validate", null, {token:context.security.acessToken}, function(errValidateToken, resultValidateToken){
                if (errValidateToken){
                    callBack(errValidateToken);
                }
                else{
                    context.security.user = resultValidateToken.user;
                    
                    Object.freeze(context.security);
                    Object.freeze(context.security.acessToken);
                    Object.freeze(confirm.security.user);

                    callBack(null, context.security.user);
                }
            });
        }
    };

    this.validatePermission = function(context, permission, callBack){
        if (context.security.user){
            context.invoke(null, "sys.security.validatePermission", null, {permission:permission}, callBack);
        }
        else{
            this.validateToken(context, function(errValidateToken, resultValidateToken){
                if (errValidateToken){
                    callBack(errValidateToken);
                }
                else{
                    context.invoke(null, "sys.security.validatePermission", null, {permission:permission}, callBack);
                }
            });
        }
    };
};

module.exports = Security;