"use strict";

var libSum = require("/lib/libSum");

module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: libSum(message.x, message.y)});
};