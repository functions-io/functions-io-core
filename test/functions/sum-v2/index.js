"use strict";

module.input = {
    x:{type:"integer", required:false},
    y:{type:"integer", required:false}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};