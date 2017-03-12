"use strict";

var FunctionsFactory = require("./factory/FunctionsFactory");

var Server = function(config){
    var self = this;
    
    this.factory = new FunctionsFactory();
    this.config = validateConfig(config);
    this.factory.isGenerateStatistics = this.config.isGenerateStatistics;
    this.pathFunctions = "functions";

    function validateConfig(config){
        if ((config === undefined) || (config === null)){
            config = {};
        }
        if ((config.unitTest === undefined) || (config.unitTest === null)){
            config.unitTest = {load: true, executeOnStart: true};
        }
        if ((config.isGenerateStatistics === undefined) || (config.isGenerateStatistics === null)){
            config.isGenerateStatistics = true;
        }
        return config;
    }
    
    this.start = function(callBack){
        this.loadAllFunctions(function(err, result){
            //Unit Test
            if (self.config.unitTest.executeOnStart){
                this.startUnitTest(callBack);
            }
            else{
                callBack(null);
            }
        });
    };

    this.loadAllFunctions = function(callBack){
        var pathBase = __dirname.substring(0, __dirname.length - 3);

        this.loadSysFunctions(pathBase, function(err, result){
            if (err){
                callBack(err);
            }
            else{
                self.loadFunctions(callBack);
            }
        });
    };

    this.loadSysFunctions = function(pathBase, callBack){
        self.factory.extension.file.addFunctionManagerFromFolder(pathBase + 'sys', null, false, function(err, result){
            if (err){
                callBack(err);
            }
            else{
                if (result.success){
                    callBack(null, result);
                }
                else
                {
                    callBack(result.error, result);
                }
            }
        });
    };

    this.loadFunctions = function(callBack){
        this.factory.extension.file.addFunctionManagerFromFolder(this.pathFunctions, this.config, true, callBack);
    };

    this.startUnitTest = function(callBack){
        console.log("unit test start");
        self.factory.invoke(null, "sys.unitTest", null, null, null, function(errUnitTest, dataUnitTest){
            if (errUnitTest){
                console.error("err execute unitTest: " + errUnitTest.message);
                callBack(errUnitTest);
            }
            else{
                if (dataUnitTest.success){
                    console.log("unit test executed with success");
                }
                else{
                    console.log("unit test executed with error");
                }
                for (var i_functionTest = 0; i_functionTest < dataUnitTest.listResult.length; i_functionTest++){
                    var itemFunctionTest = dataUnitTest.listResult[i_functionTest];
                    if (itemFunctionTest.success === false){
                        for (var i_test = 0; i_test < itemFunctionTest.listResult.length; i_test++){
                            var itemTest = itemFunctionTest.listResult[i_test];
                            if (itemTest.success === false){
                                console.log(itemFunctionTest.name + " - " + itemTest.description + " - " + itemTest.error);
                            }
                        }
                    }
                }
                callBack(null, dataUnitTest);
            }
        });
    };
};

module.exports = Server;