"use strict";

module.name = "subfolder.subfolder2.multiply";
module.version = "v1";
module.category = "test2";
module.summary = "multiply";
module.description = "multiply x * y";

module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:false}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x * message.y});
};