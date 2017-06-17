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

        if ((config.scan === undefined) || (config.scan === null)){
            config.scan = {};
        }
        if ((config.scan.automatic === undefined) || (config.scan.automatic === null)){
            config.scan.automatic = true;
        }
        if ((config.scan.interval === undefined) || (config.scan.interval === null)){
            config.scan.interval = 2000;
        }

        if ((config.enableStatistics === undefined) || (config.enableStatistics === null)){
            config.enableStatistics = true;
        }
        if ((config.enableSecurity === undefined) || (config.enableSecurity === null)){
            config.enableSecurity = false;
        }
        
        return config;
    }
};

module.exports = ConfigParse;