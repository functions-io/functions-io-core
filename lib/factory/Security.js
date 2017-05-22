"use strict";

var Security = function(){
    var self = this;

    this.config = {}
    this.config.userRolesProvider = "sys.security.provider.userRoles.mongo";
    this.config.checkPermissionProvider = "sys.security.provider.checkPermission.mongo";
    this.config.tokenValidateProvider = "sys.security.provider.token.validate";

    this.validateToken = function(context, callBack){
        if (context.security.user){
            callBack(null, context.security.user);
        }
        else{
            context.invoke(null, self.config.tokenValidateProvider, null, {token:context.security.acessToken}, function(errValidateToken, resultValidateToken){
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
            self.checkPermissionInUser(context, permission, callBack);
        }
        else{
            this.validateToken(context, function(errValidateToken, resultValidateToken){
                if (errValidateToken){
                    callBack(errValidateToken);
                }
                else{
                    self.checkPermissionInUser(context, permission, callBack);
                }
            });
        }
    };

    this.checkPermissionInUser = function(context, permission, callBack){
        context.invoke(null, this.config.userRolesProvider, null, context.security.user, function(errRoles, roles){
            if (errRoles){
                callBack(errRoles);
            }
            else{
                context.invoke(null, self.config.checkPermissionProvider, null, {permission:message.permission, roles:roles}, callBack);
            }
        });
    }
};

module.exports = Security;