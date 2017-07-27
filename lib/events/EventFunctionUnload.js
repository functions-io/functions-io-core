"use strict";

var Event = function(event){
    event.wait(function(done){
        var functionManager = event.data.functionManager;
        if (functionManager.module.unload){
            functionManager.module.unload(function(err){
                console.info("Function " + functionManager.key + " unloaded");
                done(err);
            })
        }
        else{
            console.info("Function " + functionManager.key + " unloaded");
            done();
        }
    });
};

module.exports = Event;