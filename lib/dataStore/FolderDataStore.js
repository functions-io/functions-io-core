"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");

var FolderDataStore = function(){
    var self = this;

    this.baseFolder = path.join(process.cwd(), "functions");

    this.getDataStore = function(name, version, callBack){
        let dataStore = {};
        let baseFolderFiles = null;

        if (this.baseFolder){
            baseFolderFiles = path.join(this.baseFolder, name);
        }
        else{
            callBack(null, null);
        }

        function processFilesInFolder(dirPATH, callBackProcessFilesInFolder){
            fs.readdir(dirPATH, function(errReaddir, data){
                if (errReaddir){
                    if (errReaddir.code === "ENOENT"){
                        dataStore = null;
                        callBackProcessFilesInFolder(null);
                    }
                    else{
                        callBackProcessFilesInFolder(errReaddir);
                    }
                }
                else{
                    function process(){
                        if (data.length === 0){
                            callBackProcessFilesInFolder();
                        }
                        else{
                            let item = data.pop();
                            let file = path.join(dirPATH, item);
                            
                            fs.stat(file, function(errStat, fileStat){
                                if (errStat){
                                    callBackProcessFilesInFolder(errStat);
                                }
                                else{
                                    if (fileStat.isFile() === true){
                                        fs.readFile(file, function(errRead, dataFile){
                                            if (errRead){
                                                callBackProcessFilesInFolder(errRead);
                                            }
                                            else{
                                                let item = {};
                                                
                                                item.name = file.substring(baseFolderFiles.length);
                                                if (item.name.substring(0,1) === "/"){
                                                    item.name = item.name.substring(1);
                                                }
                                                item.size = fileStat.size;
                                                item.payload = dataFile;
                                                dataStore[item.name] = item;
                                                
                                                process();
                                            }
                                        })
                                    }
                                    else if (fileStat.isDirectory() === true){
                                        processFilesInFolder(file, function(errProcessInFolder){
                                            if (errProcessInFolder){
                                                callBackProcessFilesInFolder(errProcessInFolder);
                                            }
                                            else{
                                                process();
                                            }
                                        });
                                    }
                                    else{
                                        process();
                                    }
                                }
    
                            });
                        }
                    }

                    process();
                }
            });
        }

        processFilesInFolder(baseFolderFiles, function(errProcessInFolder){
            if (errProcessInFolder){
                callBack(errProcessInFolder);
            }
            else{
                callBack(null, dataStore);
            }
        })
    
    };    
};

module.exports = FolderDataStore;