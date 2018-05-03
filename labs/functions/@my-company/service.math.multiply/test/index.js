"use strict";

const moduleTest = require("../");

let event = {};
event.x = 5;
event.y = 2;
let context = {};

moduleTest.handler(event, context, function(err, resp){
    console.log(err, resp);
})