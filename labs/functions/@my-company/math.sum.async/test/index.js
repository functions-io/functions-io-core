"use strict";

const moduleTest = require("../");

//console.log(moduleTest({x:2,y:3}));

moduleTest({x:2,y:3}).then(function(value){
    console.log(value);
});

//undefined instanceof Promise