"use strict";

var FunctionsFactory = require("./factory/FunctionsFactory");
var LoadFunctionsMonitor = require("./monitor/LoadFunctionsMonitor");

var Server = function(config){
    var self = this;
    
    //validate
    if ((config === undefined) || (config === null)){
        try{
            config = require(process.cwd() + "/config.json");
        }
        catch(errFileConfig){
            config = {};
        }
    }
    if ((config.unitTest === undefined) || (config.unitTest === null)){
        config.unitTest = {};
    }
    if ((config.unitTest.load === undefined) || (config.unitTest.load === null)){
        config.unitTest.load = true;
    }
    if ((config.unitTest.executeOnStart === undefined) || (config.unitTest.executeOnStart === null)){
        config.unitTest.executeOnStart = false;
    }
    if ((config.scan === undefined) || (config.scan === null)){
        config.scan = {};
    }
    if ((config.scan.automatic === undefined) || (config.scan.automatic === null)){
        config.scan.automatic = true;
    }
    if ((config.scan.interval === undefined) || (config.scan.interval === null)){
        config.scan.interval = 2000;
    }
    if ((config.enableStatistics === undefined) || (config.enableStatistics === null)){
        config.enableStatistics = true;
    }
    if ((config.enableSecurity === undefined) || (config.enableSecurity === null)){
        config.enableSecurity = false;
    }
    if ((config.path === undefined) || (config.path === null)){
        config.path = process.cwd() + "/functions";
    }
    if ((config.functions === undefined) || (config.functions === null)){
        config.functions = {};
    }
    if ((config.global === undefined) || (config.global === null)){
        config.global = {};
    }

    this.factory = new FunctionsFactory();
    this.config = config;
    this.factory.enableStatistics = this.config.enableStatistics;
    this.factory.enableSecurity = this.config.enableSecurity;
    this.factory.configFunctions = this.config.functions;
    this.factory.global = this.config.global;
    this.pathFunctions = this.config.path;
    this.loadFunctionsMonitor = null;
    
    this.start = function(callBack){
        this.loadAllFunctions(function(err, result){
            //Unit Test
            if (self.config.unitTest.executeOnStart){
                self.startUnitTest(function(errUnitTest, dataUnitTest){
                    self.startMonitor();
                    callBack(errUnitTest, dataUnitTest);
                });
            }
            else{
                self.startMonitor();
                callBack(null);
            }
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