"use strict";

const mathMultiply = require("@my-company/math.multiply");

module.exports.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};

module.exports.output = {
    value:{type:"integer"}
};

module.exports.handler = function(event, context, callback){
    callback(null, mathMultiply(event.x, event.y));
}