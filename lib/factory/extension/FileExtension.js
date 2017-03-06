"use strict";

var fs = require("fs");
var path = require("path");

var FileExtension = function(factory){
    var self = this;
    
    this.factory = factory;
    
    this.addFunctionManagerFromFolder = function(basePATH, opt, callBack){
        fs.access(basePATH, fs.constants.R_OK, function(err){
            if (err){
                console.error(err.message);
            }
            else{
                self.getListFiles(basePATH, opt, function(err, files){
                    if (err){
                        callBack(err);
                    }
                    else{
                        self.addFunctionManagerFromFiles(files, callBack);
                    }
                });
            }
        });
    };

    this.addFunctionManagerFromFiles = function(filesPATH, callBack){
        var cont = 0;
        var result = {};
        var total = filesPATH.length;

        result.success = true;
        result.files = [];

        filesPATH.map(function(item){
            var opt, filePATH;
            
            if (typeof(item) === "string"){
                opt = {};
                filePATH = item;
            }
            else if (typeof(item) === "object"){
                opt = item;
                filePATH = item.file;
            }
            else{
                return;
            }
            
            self.addFunctionManagerFromFile(filePATH, opt, function(err, key){
                var newItemResult = {};
                if (err){
                    result.success = false;
                    newItemResult.success = false;
                    newItemResult.error = err;
                }
                else{
                    newItemResult.success = true;
                    newItemResult.key = key;
                }
                newItemResult.file = filePATH;
                result.files.push(newItemResult);
                cont ++;
                if (cont === total){
                    callBack(null, result);
                }
            })
        })
    };

    this.addFunctionManagerFromFile = function(filePATH, opt, callBack){
        if ((opt === undefined) || (opt === null)){
            opt = {};
            opt.filePATH = filePATH;
        }
        fs.readFile(filePATH, function(err, code){
            if (err){
                console.error("Function " + opt.filePATH + " Not Read: " + err);
                if (callBack){
                    callBack(err);
                }
            }
            else{
                self.factory.addFunctionManagerFromCode(code, opt, callBack);
            }
        });
    };

    this.isValidFile = function(filePATH, opt){
        var result;
        var pathParse = path.parse(filePATH);
        var unitTestLoad = false;

        if (opt){
            if (opt.unitTest){
                if (opt.unitTest.load){
                    unitTestLoad = true;
                }
            }
        }

        if (filePATH){
            result = pathParse.ext.toUpperCase() === ".JS";

            if (pathParse.name.substring(0, 1) === "_"){
                result = false;
            }

            if (unitTestLoad === false){
                if (filePATH.substring(filePATH.length - 8).toUpperCase() === ".TEST.JS"){
                    result = false;
                }
            }

            return result;
        }
        else{
            return false;
        }
    };

    this.getNameAndVersion = function(path, filePATH){
        var result = {};
        var tempName = filePATH.substring(path.length + 1);
        tempName = tempName.substring(0, tempName.length - 3);
        tempName = tempName.replace(/\/|\\/g,".");
        var tempNameArray = tempName.split("-");
        result.name = tempNameArray[0];
        if (tempNameArray.length === 2){
            result.version = tempNameArray[1];
        }
        else{
            result.version = "";
        }
        return result;
    };

    this.getListFiles = function(path, opt, callBack){
        var listFiles = [];
        
        if (path === null){
            callBack(null, listFiles);
            return;
        }

        function findFilesInDirectory(basePATH, callBackFind){
            var contTotal = 0;
            var contProcessed = 0;

            fs.readdir(basePATH, function(err, data){
               if (err){
                    console.error(err);
                    callBackFind(err);
                }
                else{
                    contTotal = data.length;
                    if (contTotal === 0){
                        //empty directory
                        callBackFind(null);
                        return;
                    }
                    else{
                        //console.log("in directory(" + contTotal + ") : " + basePATH);
                        for (var i = 0; i < contTotal; i++){
                            (function(filePATH){
                                fs.stat(filePATH, function(errStat, fileStat){
                                    if (errStat){
                                        contProcessed ++;
                                    }
                                    else{
                                        if (fileStat.isFile() === true){
                                            if (self.isValidFile(filePATH, opt)){
                                                var tempNameAndVersion = self.getNameAndVersion(path, filePATH);
                                                listFiles.push({file:filePATH, stat:fileStat, name: tempNameAndVersion.name, version: tempNameAndVersion.version});
                                            }
                                            contProcessed ++;
                                        }
                                        else if (fileStat.isDirectory() === true){
                                            findFilesInDirectory(filePATH, function(){
                                                contProcessed ++;
                                                if (contProcessed === contTotal){
                                                    //console.log("out directory - processed " + contProcessed + " : " + basePATH);
                                                    callBackFind(null);
                                                }
                                            });
                                        }
                                        else{
                                            contProcessed ++;
                                        }
                                    }
                                    if (contProcessed === contTotal){
                                        //console.log("out directory - processed " + contProcessed + " : " + basePATH);
                                        callBackFind(null);
                                    }
                                });
                            })(basePATH + "/" + data[i]);
                        }
                    }
                }
            });
        }

        findFilesInDirectory(path, function(err){
            callBack(err, listFiles);
        });
    };
};

module.exports = FileExtension;