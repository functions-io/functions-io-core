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
                self.addFunctionManagerFromFiles(files, callBack);
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
                if (itemLastListFiles.stat.mtime.getTime() === itemFile.stat.mtime.getTime()){
                    //check fileMain change
                    if (itemLastListFiles.statMain){
                        var statMain = fs.statSync(itemLastListFiles.fileMain);
                        if (itemLastListFiles.statMain.mtime.getTime() === statMain.mtime.getTime()){
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

    this.addFunctionManagerFromFiles = function(files, callBack){
        var cont = 0;
        var result = {};
        var total = files.length;

        result.success = true;
        result.files = [];

        files.map(function(item){
            if (item.status === undefined || item.status === "ADD" || item.status === "CHANGED"){
                if (item.status === "CHANGED"){
                    self.factory.removeFunctionManagerFromFileName(item.file);
                }
                self.addFunctionManagerFromFile(item, function(err, key){
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

    this.addFunctionManagerFromFile = function(item, callBack){
        fs.readFile(item.file, function(err, packageText){
            if (err){
                console.error("package.json " + filePATH + " Not Read: " + err);
                if (callBack){
                    callBack(err);
                }
            }
            else{
                var packageObj = JSON.parse(packageText);
                item.fileMain = item.dirPATH + "/" + packageObj.main;
                item.package = packageObj || {};

                fs.stat(item.fileMain, function(errStat, fileStat){
                    if (errStat){
                        callBack(errStat);
                    }
                    else{
                        fs.readFile(item.fileMain, function(err, code){
                            if (err){
                                console.error("Function " + item.fileMain + " Not Read: " + err);
                                if (callBack){
                                    callBack(err);
                                }
                            }
                            else{
                                item.statMain = fileStat;
                                self.factory.addFunctionManagerFromCode(code, item, callBack);
                            }
                        });
                    }
                });
            }
        });
    }
};

module.exports = FileExtension;