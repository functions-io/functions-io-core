"use strict";

module.input = {
    name:{type:"string", required:false}
};
module.output = {
    list:{type:"array", required:true, items: {
        description:{type:"string", required:true},
        result:{type:"boolean", required:true},
        err:{type:"string", required:true}
    }}
};

module.exports = function(context, message, callBack){
    var keys;
    var resultTest = {success:true, total:0};
    var listExec = [];
    var functionManager;
    var qtdExec;
    var factory = module._factory;
    var diffTime = 0;
    var start = process.hrtime();

    function checkEndTest(){
        if (resultTest.listResult.length === qtdExec){
            diffTime = process.hrtime(start);
            diffTime = ((diffTime[0] * 1e3) + (diffTime[1] / 1e6));
            resultTest.time = diffTime;

            callBack(null, resultTest);
        }
    }

    try{
        resultTest.success = true;
        resultTest.listResult = [];

        keys = Object.keys(factory.listFunctionManagerByFile);

        for (var i_function = 0; i_function < keys.length; i_function++){
            functionManager = factory.listFunctionManagerByFile[keys[i_function]];
            if ((functionManager.stage) && (functionManager.stage === "_test")){
                listExec.push(functionManager);
            }
        }
        qtdExec = listExec.length;
        if (qtdExec === 0){
            callBack(null, resultTest);
            return;
        }

        for (var i = 0; i < qtdExec; i++){
            (function(item){
                try{
                    console.log("executing test function " + item.name);
                    item.module.exports(context, null, function(err, data){
                        var testInfo;
                        console.log("end test function " + item.name);
                        if (err){
                            testInfo = {};
                            testInfo.success = false;
                            testInfo.error = err.message;
                            testInfo.listResult = [];
                        }
                        else{
                            testInfo = data;
                        }

                        if (testInfo.success === false){
                            resultTest.success = false;
                        }

                        testInfo.name = item.name;
                        resultTest.total += testInfo.listResult.length;
                        resultTest.listResult.push(testInfo);

                        checkEndTest();
                    });
                }
                catch(errTest){
                    var testInfo;
                    testInfo = {};
                    testInfo.success = false;
                    testInfo.error = err.message;
                    testInfo.listResult = [];
                    testInfo.name = item.name;
                    resultTest.listResult.push(testInfo);
                    resultTest.success = false;

                    checkEndTest();
                }
            })(listExec[i]);
        }
    }
    catch(errTest){
        callBack(errTest);
    }
};