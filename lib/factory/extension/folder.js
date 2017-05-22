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
};

module.exports = new Folder();