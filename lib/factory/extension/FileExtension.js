"use strict";

var fs = require("fs");
var path = require("path");
var File = require("./File");

var FileExtension = function(factory){
    var self = this;
    
    this.factory = factory;
    this.file = new File();

    this.addFunctionManagerFromFolder = function(basePATH, callBack){
        this.file.getFiles(basePATH, function(err, files){
            if (err){
                callBack(err);
            }
            else{
                self.addFunctionManagerFromPackageFiles(files, callBack);
            }
        });
    };

    this.addFunctionManagerFromFolderModules = function(callBack){
        this.file.getListFilesModules(function(err, files){
            if (err){
                callBack(err);
            }
            else{
                self.addFunctionManagerFromPackageFiles(files, callBack);
            }
        });
    };

    this.addFunctionManagerFromPackageFiles = function(files, callBack){
        var cont = 0;
        var contSuccess = 0;
        var total = files.length;

        if (files.length === 0){
            callBack(null, contSuccess);
            return;
        }

        files.map(function(file){
            self.addFunctionManagerFromPackageFile(file, function(err, functionManager){
                if (!(err)){
                    contSuccess ++;
                }
                cont ++;
                if (cont === total){
                    callBack(null, contSuccess);
                }
            })
        })
    };

    this.addFunctionManagerFromPackageFile = function(filePackage, callBack){
        fs.readFile(filePackage, function(errFilePackage, packageText){
            if (errFilePackage){
                console.error("package.json " + filePackage + " Not Read: " + errFilePackage);
                if (callBack){
                    callBack(errFilePackage);
                }
            }
            else{
                self.addFunctionManagerFromPackageText(filePackage, JSON.parse(packageText), callBack);
            }
        });
    };

    this.addFunctionManagerFromPackageText = function(filePackage, packageObj, callBack){
        var item = {};
        
        item.basePATH = path.dirname(filePackage);
        item.package = packageObj
        item.filePackage = filePackage;
        item.fileMain = item.basePATH + "/" + item.package.main;
        if (item.package.test){
            item.fileTest = item.basePATH + "/" + item.package.test;
        }

        this.addFunctionManagerFromFile(item.fileMain, item, callBack);
    };

    this.addFunctionManagerFromFile = function(file, opt, callBack){
        fs.readFile(file, function(errFile, code){
            if (errFile){
                console.error("Function " + file + " Not Read: " + errFile);
                if (callBack){
                    callBack(errFile);
                }
            }
            else{
                self.factory.addFunctionManagerFromCode(code, opt, function(errAddFunc, functionManager){
                    if (errAddFunc){
                        callBack(errAddFunc);
                    }
                    else{
                        callBack(null, functionManager);
                    }
                });
            }
        });
    };
};

module.exports = FileExtension;