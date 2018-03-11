"use strict";

const os = require("os");
const fs = require("fs");
const extractTAR = require("./extractTAR");

var FileTarballDataStore = function(){
    var self = this;

    this.baseFolder = os.homedir + "/.functions-io";

    this.getFileName = function(name, version){
        return self.baseFolder + "/" + name + "@" + version + ".tgz";
    };

    this.getDataStore = function(name, version, callBack){
        this.readTarball(name, version, function(err, buffer){
            if (err){
                callBack(err);
            }
            else{
                extractTAR.extractGZ(buffer, function(errExtract, dataStore){
                    callBack(errExtract, dataStore);
                });
            }
        })
    };

    this.readTarball = function(name, version, callBack){
        var fileName = this.getFileName(name, version);

        fs.readFile(fileName, function(errReadFile, data){
            if (errReadFile){
                callBack(errReadFile);
            }
            else{
                callBack(null, data);
            }
        });
    };

    this.saveTarball = function(name, version, buffer, callBack){
        fs.access(self.baseFolder, function(err) {
            var fileName = self.getFileName(name, version);

            if (err && err.code === "ENOENT") {
                try{
                    fs.mkdirSync(self.baseFolder);
                }
                catch(errMakeFolder){
                    callBack(errMakeFolder);
                }
            }

            fs.writeFile(fileName, buffer, function(errWriteFile){
                if (errWriteFile){
                    callBack(errWriteFile);
                }
                else{
                    callBack(null);
                }
            });
        });
    };
};

module.exports = FileTarballDataStore;