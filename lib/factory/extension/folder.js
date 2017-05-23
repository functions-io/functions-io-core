"use strict";

var fs = require("fs");
var path = require("path");

var Folder = function(){
    var self = this;
    
    this.getFiles = function(basePATH, callBack){
        fs.access(basePATH, fs.constants.R_OK, function(err){
            if (err){
                callBack(err);
            }
            else{
                self.getListFiles(basePATH, callBack);
            }
        });
    };

    this.getListFiles = function(path, callBack){
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
                                            if (filePATH.substring(filePATH.length - 12) === "package.json"){
                                                listFiles.push({file:filePATH, stat:fileStat, dirPATH: basePATH, basePATH: path});
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

    this.getListFilesModules = function(callBack){
        var basePATH = process.cwd() + "/node_modules";
        var listModules = [];
        var listFiles = [];
        
        var processFolder = function(index){
            if (index === listModules.length){
                callBack(null, listFiles);
            }
            else{
                self.getListFiles(listModules[index], function(err, list){
                    if (list){
                        listFiles = listFiles.concat(list);
                    }
                    processFolder(index + 1);
                });
            }
        }

        fs.readdir(basePATH, function(err, data){
            if (err){
                if (err.code !== "ENOENT"){
                    console.error(err);
                    callBack(err);
                }
                else{
                    callBack(null, listFiles);
                }
            }
            else{
                var contTotal = data.length;
                for (var i = 0; i < contTotal; i++){
                    if (data[i].indexOf("functions-io-modules-") === 0){
                        listModules.push(basePATH + "/" + data[i]);
                    }
                }
                if (listModules.length === 0){
                    callBack(null, listFiles);
                }
                else{
                    processFolder(0);
                }
            }
        });
    }
};

module.exports = new Folder();