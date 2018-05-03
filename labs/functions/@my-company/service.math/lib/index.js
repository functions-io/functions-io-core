"use strict";

const mathSum = require("@my-company/math.sum");
const mathMultiply = require("@my-company/math.multiply");

module.exports.sum = function(x,y){
    return mathSum(x, y);
}

module.exports.multiply = function(x,y){
    return mathMultiply(x, y);
}