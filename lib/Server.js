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
    if ((config.test === undefined) || (config.test === null)){
        config.test = {};
    }
    if ((config.test.load === undefined) || (config.test.load === null)){
        config.test.load = true;
    }
    if ((config.test.executeOnStart === undefined) || (config.test.executeOnStart === null)){
        config.test.executeOnStart = true;
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
            //test
            if (self.config.test.executeOnStart){
                self.startTest(function(errTest, dataTest){
                    self.startMonitor();
                    callBack(errTest, dataTest);
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
        self.factory.extension.fileModules.addFunctionManagerFromFolderModules(this.config, true, function(err, result){
            if (err){
                callBack(err);
            }
            else{
                if (result.success){
                    self.factory.extension.file.addFunctionManagerFromFolder(self.pathFunctions, self.config, true, callBack);
                }
                else
                {
                    callBack(result.error, result);
                }
            }
        });
        //this.factory.extension.file.addFunctionManagerFromFolder(this.pathFunctions, this.config, true, callBack);
    };

    this.startTest = function(callBack){
        console.log("test start");
        self.factory.invoke(null, "sys.test", "1.0.0", null, null, function(errTest, dataTest){
            if (errTest){
                console.error("err execute test: " + errTest.message);
                callBack(errTest);
            }
            else{
                if (dataTest.success){
                    console.log("test executed with success");
                }
                else{
                    console.log("test executed with error");
                }
                for (var i_functionTest = 0; i_functionTest < dataTest.listResult.length; i_functionTest++){
                    var itemFunctionTest = dataTest.listResult[i_functionTest];
                    if (itemFunctionTest.success === false){
                        for (var i_test = 0; i_test < itemFunctionTest.listResult.length; i_test++){
                            var itemTest = itemFunctionTest.listResult[i_test];
                            if (itemTest.success === false){
                                console.log(itemFunctionTest.name + " - " + itemTest.description + " - " + itemTest.error);
                            }
                        }
                    }
                }
                callBack(null, dataTest);
            }
        });
    };
};

module.exports = Server;