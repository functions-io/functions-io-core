"use strict";

const mathSum1 = require("@performance1/math.sum.1");
const mathSum2 = require("@performance1/math.sum.2");
const mathSum3 = require("@performance1/math.sum.3");
const mathSum4 = require("@performance1/math.sum.4");
const mathSum5 = require("@performance1/math.sum.5");
const mathSum6 = require("@performance1/math.sum.6");
const mathSum7 = require("@performance1/math.sum.7");
const mathSum8 = require("@performance1/math.sum.8");
const mathSum9 = require("@performance1/math.sum.9");
const mathSum10 = require("@performance1/math.sum.10");

module.exports.sum = function(x,y){
    mathSum10(2,3);
    mathSum9(2,3);
    mathSum8(2,3);
    mathSum7(2,3);
    mathSum6(2,3);
    mathSum5(2,3);
    mathSum4(2,3);
    mathSum3(2,3);
    mathSum2(2,3);
    mathSum1(2,3);

    return x + y;
}