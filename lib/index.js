"use strict";

var Server = require("./Server");

module.exports.createServer = function(config){
    return new Server(config);
}