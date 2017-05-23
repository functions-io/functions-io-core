"use strict";

module.input = {
    x:{type:"integer", required:false, default: 10},
    y:{type:"integer", required:false, default: 5}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    { // simulate err here
    callBack(null, {value: message.x + message.y});
};