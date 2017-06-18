"use strict";

var FunctionsFactory = require("./factory/FunctionsFactory");
var LoadFunctionsMonitor = require("./monitor/LoadFunctionsMonitor");
var ConfigParse = require("./ConfigParse");
var configParse = new ConfigParse();

var events = require('events');
var eventEmitter = new events.EventEmitter();

var Server = function(config){
    var self = this;
    
    this.factory = new FunctionsFactory();
    this.config = configParse.parse(config);
    this.factory.enableStatistics = this.config.enableStatistics;
    this.factory.enableSecurity = this.config.enableSecurity;
    this.factory.configFunctions = this.config.functions;
    this.factory.global = this.config.global;
    this.pathFunctions = this.config.path;
    this.loadFunctionsMonitor = null;
    
    this.start = function(callBack){
        this.loadFunctions(function(err, result){
            eventEmitter.emit("functions-io.start", self);
            self.startMonitor();
            callBack(null);
        });
    };

    this.stop = function(){
        this.stopMonitor();
    };

    this.startMonitor = function(){
        if (this.config && this.config.scan && this.config.scan.automatic){
            this.loadFunctionsMonitor = new LoadFunctionsMonitor(this, this.config.scan.interval);
            this.loadFunctionsMonitor.start();
            console.log("Functions monitor started");
        }
    };

    this.stopMonitor = function(){
        if (this.loadFunctionsMonitor){
            this.loadFunctionsMonitor.stop();
        }
    };

    this.loadFunctions = function(callBack){
        self.factory.extension.fileModules.addFunctionManagerFromFolderModules(true, function(err, result){
            if (err){
                callBack(err);
            }
            else{
                if (result.success){
                    self.factory.extension.file.addFunctionManagerFromFolder(self.pathFunctions, true, callBack);
                }
                else
                {
                    callBack(result.error, result);
                }
            }
        });
    };
};

module.exports = Server;