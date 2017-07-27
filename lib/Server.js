"use strict";

var FunctionsInvoke = require("./FunctionsInvoke");
var ConfigParse = require("./ConfigParse");
var configParse = new ConfigParse();

var Server = function(config){
    var self = this;
    
    this.config = configParse.parse(config);

    this.functionsInvoke = new FunctionsInvoke();
    this.functionsInvoke.global = this.config.global;
    this.functionsInvoke.functionsFactory.configFunctions = this.config.functions;
    this.events = this.functionsInvoke.events;

    this.events.on("PRE_LOAD_FUNCTION", require("./events/EventFunctionLoad"));
    this.events.on("POS_UNLOAD_FUNCTION", require("./events/EventFunctionUnload"));
    this.events.on("PRE_INVOKE", require("./events/EventValidate"));

    this.start = function(callBack){
        this.loadFunctions(function(err, result){
            var event = {};
            event.resultErr = err;
            event.resultData = result;
            event.server = self;
            self.events.emit("START", event, function(){
                callBack(err, result);
            });
        });
    };

    this.stop = function(){
        var event = {};
        event.server = self;
        this.events.emit("STOP", event, function(){
            //
        });
    };

    this.loadFunctions = function(callBack){
        this.functionsInvoke.loadFunctions(self.config.path, callBack);
    };
};

module.exports = Server;