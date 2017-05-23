"use strict";

var fs = require("fs");
var path = require("path");
var folder = require("./folder");

var FileExtension = function(factory){
    var self = this;
    var lastListFiles = {};
    
    this.factory = factory;
    
    this.addFunctionManagerFromFolder = function(basePATH, opt, trackFileChanged, callBack){
        folder.getFiles(basePATH, function(err, files){
            if (err){
                callBack(err);
            }
            else{
                if (trackFileChanged){
                    files = self.processListFiles(files);
                }
                self.addFunctionManagerFromFiles(files, opt, callBack);
            }
        });
    };

    this.processListFiles = function(files){
        var newListFiles = {};

        files = files.map(function(itemFile){
            var itemLastListFiles = lastListFiles[itemFile.file];
            
            if (itemLastListFiles){
                itemFile.statMain = itemLastListFiles.statMain;
                itemFile.fileMain = itemLastListFiles.fileMain;
                itemFile.statTest = itemLastListFiles.statTest;
                itemFile.fileTest = itemLastListFiles.fileTest;
                if (itemLastListFiles.stat.mtime.getTime() === itemFile.stat.mtime.getTime()){
                    if (itemLastListFiles.statMain){ //check fileMain change
                        var statMain = fs.statSync(itemLastListFiles.fileMain);
                        if (itemLastListFiles.statMain.mtime.getTime() === statMain.mtime.getTime()){
                            if (itemLastListFiles.statTest){ //check fileTest change
                                var statTest = fs.statSync(itemLastListFiles.fileTest);
                                if (itemLastListFiles.statTest.mtime.getTime() === statTest.mtime.getTime()){
                                    itemFile.status = "NOTCHANGED";
                                }
                                else{
                                    itemFile.status = "CHANGED";
                                }
                            }
                            else{
                                itemFile.status = "NOTCHANGED";
                            }
                        }
                        else{
                            itemFile.status = "CHANGED";
                        }
                    }
                    else{
                        itemFile.status = "NOTCHANGED";
                    }
                }
                else{
                    itemFile.status = "CHANGED";
                }
            }
            else{
                itemFile.status = "ADD";
            }

            newListFiles[itemFile.file] = itemFile;
            
            delete lastListFiles[itemFile.file];

            return itemFile;
        });

        Object.keys(lastListFiles).map(function(key){
            var itemFile = lastListFiles[key];
            itemFile.status = "REMOVE";
            files.push(itemFile);
        });

        lastListFiles = newListFiles;

        return files;
    };

    this.addFunctionManagerFromFiles = function(files, opt, callBack){
        var cont = 0;
        var result = {};
        var total = files.length;

        result.success = true;
        result.files = [];

        if (files.length === 0){
            callBack(null, result);
            return;
        }

        files.map(function(item){
            if (item.status === undefined || item.status === "ADD" || item.status === "CHANGED"){
                if (item.status === "CHANGED"){
                    self.factory.removeFunctionManagerFromFileName(item.file);
                }
                self.addFunctionManagerFromPackageFile(item, opt, function(err, key){
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
                    newItemResult.file = item.file;
                    result.files.push(newItemResult);
                    cont ++;
                    if (cont === total){
                        callBack(null, result);
                    }
                })
            }
            else if (item.status && item.status === "REMOVE"){
                self.factory.removeFunctionManagerFromFileName(item.file);
                cont ++;
                if (cont === total){
                    callBack(null, result);
                }
            }
            else{
                cont ++;
                if (cont === total){
                    callBack(null, result);
                }
            }
        })
    };

    this.addFunctionManagerFromPackageFile = function(item, opt, callBack){
        var testLoad = false;
        
        if ((opt) && (opt.test) && (opt.test.load)){
            testLoad = true;
        }
        
        fs.readFile(item.file, function(err, packageText){
            if (err){
                console.error("package.json " + filePATH + " Not Read: " + err);
                if (callBack){
                    callBack(err);
                }
            }
            else{
                item.package = JSON.parse(packageText);
                item.fileMain = item.dirPATH + "/" + item.package.main;
                if (testLoad && item.package.test){
                    item.fileTest = item.dirPATH + "/" + item.package.test;
                }

                self.addFunctionManagerFromFile(item, item.fileMain, function(errFuncMain, fileStatMain){
                    if (errFuncMain){
                        callBack(errFuncMain);
                    }
                    else{
                        item.statMain = fileStatMain;
                        if (item.fileTest){
                            self.addFunctionManagerFromFile(item, item.fileTest, function(errFuncTest, fileStatTest){
                                item.statTest = fileStatTest;
                                callBack(null);
                            });
                        }
                        else{
                            callBack(null);
                        }
                    }
                });
            }
        });
    }

    this.addFunctionManagerFromFile = function(item, file, callBack){
        fs.stat(file, function(errStat, fileStat){
            if (errStat){
                callBack(errStat);
            }
            else{
                fs.readFile(file, function(err, code){
                    if (err){
                        console.error("Function " + item.fileMain + " Not Read: " + err);
                        if (callBack){
                            callBack(err);
                        }
                    }
                    else{
                        self.factory.addFunctionManagerFromCode(code, item, function(errAddFunc){
                            if (errAddFunc){
                                callBack(errAddFunc);
                            }
                            else{
                                callBack(null, fileStat);
                            }
                        });
                    }
                });
            }
        });
    }
};

module.exports = FileExtension;