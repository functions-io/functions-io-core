"use strict";

module.exports = function(context, message, callBack){
    var keys;
    var qtdTest;
    var factory = this._factory;
    var functionTest = this.functionTest;
    var resultTest = {};
    var test = this.test;
    var after = this.after;
    
    resultTest.success = true;
    resultTest.listResult = [];

    keys = Object.keys(test);
    qtdTest = keys.length;

    var invoke = function(stage, name, version, dataInvoke, callBackInvoke){
        factory.invoke(stage, name, version, dataInvoke, context, callBackInvoke);
    }

    var run = function(indexRun, callBackRun){
        try{
            var start = process.hrtime();
            var key = keys[indexRun];
            var itemRun = test[key];
            
            itemRun(invoke, function(err){
                var result = {};
                if (err){
                    result.success = false;
                    result.error = err.message;
                    resultTest.success = false;
                }
                else{
                    result.success = true;
                }
                
                result.description = key;
                result.time = (process.hrtime(start)[1] / 1000);
                resultTest.listResult.push(result);

                callBackRun(err);
            }, context);
        }
        catch(errCallTest){
            callBackRun(errCallTest);
        }
    }

    var runAll = function(callBackRunAll){
        var cont = 0;
        for (var i = 0; i < qtdTest; i++){
            run(i, function(){
                cont++;
                if (cont === qtdTest){
                    if (after){
                        try{
                            after(invoke, function(err){
                                if (err){
                                    resultTest.success = false;
                                    callBackRunAll(err);
                                }
                                else{
                                    callBackRunAll(null);
                                }
                            }, context);
                        }
                        catch(errAfter){
                            resultTest.success = false;
                            callBackRunAll(errAfter);
                        }
                    }
                    else{
                        callBackRunAll(null);
                    }
                }
            })
        }
    }

    if (this.before){
        try{
            this.before(invoke, function(err){
                if (err){
                    resultTest.success = false;
                    callBack(err, resultTest);
                }
                else{
                    runAll(function(err){
                        callBack(err, resultTest);
                    });
                }
            }, context);
        }
        catch(errBefore){
            resultTest.success = false;
            callBack(errBefore, resultTest);
        }
    }
    else{
        runAll(function(err){
            callBack(err, resultTest);
        });
    }
}