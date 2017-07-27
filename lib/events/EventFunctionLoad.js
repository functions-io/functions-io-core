"use strict";

var Event = function(event){
    event.wait(function(done){
        var functionManager = event.data.functionManager;
        if (functionManager.module.load){
            functionManager.module.load(function(err){
                if (err){
                    done(err);
                }
                else{
                    console.info("Function " + functionManager.key + " loaded");
                    done();
                }
            })
        }
        else{
            console.info("Function " + functionManager.key + " loaded");
            done();
        }
    });
};

module.exports = Event;