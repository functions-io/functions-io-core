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

    var run = function(indexRun, callBackRun){
        try{
            var start = process.hrtime();
            var key = keys[indexRun];
            var itemRun = test[key];
            
            itemRun(context, function(err){
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
                result.time = process.hrtime(start);
                result.time = ((result.time[0] * 1e3) + (result.time[1] / 1e6));
                resultTest.listResult.push(result);

                callBackRun(err);
            });
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
                            after(context, function(err){
                                if (err){
                                    resultTest.success = false;
                                    callBackRunAll(err);
                                }
                                else{
                                    callBackRunAll(null);
                                }
                            });
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
            this.before(context, function(err){
                if (err){
                    resultTest.success = false;
                    callBack(err, resultTest);
                }
                else{
                    runAll(function(err){
                        callBack(err, resultTest);
                    });
                }
            });
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