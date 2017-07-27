"use strict";

var ConfigParse = function(){
    this.parse = function(config){
        if ((config === undefined) || (config === null)){
            try{
                config = require(process.cwd() + "/config.json");
            }
            catch(errFileConfig){
                config = {};
            }
        }

        if ((config.path === undefined) || (config.path === null)){
            config.path = process.cwd() + "/functions";
        }

        if ((config.functions === undefined) || (config.functions === null)){
            config.functions = {};
        }

        if ((config.global === undefined) || (config.global === null)){
            config.global = {};
        }

        if ((config.scanFiles === undefined) || (config.scanFiles === null)){
            config.scanFiles = false;
        }
        
        return config;
    }
};

module.exports = ConfigParse;