"use strict";

module.name = "sum";
module.version = "v1";
module.category = "test";
module.summary = "sum";
module.description = "sum x + y";

module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};