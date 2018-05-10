"use strict";

const mathSum1 = require("@performance2/math.sum.1");
const mathSum2 = require("@performance2/math.sum.2");
const mathSum3 = require("@performance2/math.sum.3");
const mathSum4 = require("@performance2/math.sum.4");
const mathSum5 = require("@performance2/math.sum.5");

module.exports.sum = function(x,y){
    mathSum5(2,3);
    mathSum4(2,3);
    mathSum3(2,3);
    mathSum2(2,3);
    mathSum1(2,3);

    return x + y;
}