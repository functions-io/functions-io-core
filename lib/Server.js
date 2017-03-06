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
        this.loadFunctions(function(err, result){
            //Unit Test
            if (self.config.unitTest.executeOnStart){
                this.startUnitTest(callBack);
            }
            else{
                callBack(null);
            }
        });
    };

    this.loadFunctions = function(callBack){
        var pathBase = __dirname.substring(0, __dirname.length - 3);

        self.factory.extension.file.addFunctionManagerFromFolder(pathBase + 'sys', null, function(err, result){
            if (err){
                callBack(err);
            }
            else{
                if (result.success){
                    self.factory.extension.file.addFunctionManagerFromFolder(self.pathFunctions, self.config, callBack);
                }
                else
                {
                    callBack(result.error, result);
                }
            }
        });
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