"use strict";

var InputValidate = require("../InputValidate");
var inputValidate = new InputValidate();

var Event = function(event){
    var validateResult = inputValidate.parse(event.data.functionManager.name, event.data.message, event.data.functionManager.module.input);

    if (validateResult.error){
        var err = new RangeError("InputData");
        err.data = validateResult.error;
        throw err;
    }
};

module.exports = Event;