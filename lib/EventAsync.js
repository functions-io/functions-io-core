"use strict";

var EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter();

var FunctionWait = function(fn){
    this.nextEvent.push(fn);
}

class EventEmitterAsync extends EventEmitter {
    emit(eventName, data, done){
        if (done === undefined){
            super.emit(eventName, event);
        }
        else{
            try{
                var event = {};
                event.nextEvent = [];
                event.data = data;
                event.wait = FunctionWait;
                
                super.emit(eventName, event);
            }
            catch(err){
                done(err);
                return;
            }

            if (event.nextEvent.length === 0){
                done();
            }
            else{
                var processarCallBack = function(err){
                    if (err){
                        done(err);
                    }
                    else{
                        processar();
                    }
                }

                var processar = function(){
                    var next = event.nextEvent.pop();
                    if (next){
                        try{
                            next(processarCallBack);
                        }
                        catch(err){
                            done(err);
                        }
                    }
                    else{
                        done();
                    }
                }

                processar();
            }
        }
    }
}

module.exports = EventEmitterAsync;