"use strict";

module.name = "sum";
module.version = "v3";
module.category = "test";
module.summary = "sum";
module.description = "sum x + y";

module.input = {
    x:{type:"integer", required:false, default: 10},
    y:{type:"integer", required:false, default: 5}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};