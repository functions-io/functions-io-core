"use strict";

var libSum = require("/lib/libSum");

module.input = {
    x:{type:"integer", required:false, default: 10},
    y:{type:"integer", required:false, default: 5}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: libSum(message.x, message.y)});
};