"use strict";

var Security = function(){
    this.validatePermission = function(context, permission, callBack){
        context.invoke(null, "sys.security.validateToken", null, {permission:permission}, callBack);
    };
};

module.exports = Security;