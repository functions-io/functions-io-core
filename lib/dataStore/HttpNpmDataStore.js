"use strict";

//Patch releases: 1.0 or 1.0.x or ~1.0.4
//Minor releases: 1 or 1.x or ^1.0.4
//Major releases: * or x
//https://registry.npmjs.org/[module]

const os = require("os");
const fs = require("fs");
const http = require("http");
const https = require("https");
const urlParse = require("url");
const extractTAR = require("./extractTAR");
const semver = require("semver");

var HttpNpmDataStore = function(){
    var self = this;

    this.baseURL = "https://registry.npmjs.org";
    this.baseFolder = os.homedir + "/.functions-io";
    this.enableCacheDisk = true;
    
    //this.baseURL = "http://localhost:8081/repository/repositorio1";
    //npm config set strict-ssl false
    //npm install lodash --registry https://localhost:3000

    this.getFileName = function(name, version){
        return self.baseFolder + "/" + name + "@" + version + ".tgz";
    };

    this.getDataStore = function(name, version, callBack){
        this.downloadTarball(name, version, function(err, buffer, versionTarget){
            if (err){
                callBack(err);
            }
            else{
                extractTAR.extractGZ(buffer, function(errExtract, dataStore){
                    callBack(errExtract, dataStore, versionTarget);
                });
            }
        })
    };
    
    this.getModuleManifest = function(name, callBack){
        var url = this.baseURL + "/" + name;

        var headers = this.buildHeaders();

        //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
        headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";

        this.request(url, headers, function(err, data){
            if (err){
                callBack(err);
            }
            else{
                callBack(null, JSON.parse(data));
            }
        });
    };

    this.getVersion = function(name, version, callBack){
        if (semver.valid(version)){
            callBack(null, version);
        }
        else{
            this.getModuleManifest(name, function(err, manifest){
                if (err){
                    callBack(err);
                }
                else{
                    //check tag ????? https://github.com/npm/npm/blob/d46015256941ddfff1463338e3e2f8f77624a1ff/lib/utils/pick-manifest-from-registry-metadata.js
                    let versions = Object.keys(manifest.versions);
                    let resolvedTo = semver.maxSatisfying(versions, version, true);
                    callBack(null, resolvedTo);
                }
            });
        }
    };

    this.downloadTarballFromFileDisk = function(name, version, callBack){
        if (this.enableCacheDisk){
            this.readTarball(name, version, callBack);
        }
        else{
            callBack(null, null);
        }
    };

    this.downloadTarball = function(name, version, callBack){
        this.getVersion(name, version, function(err, versionTarget){
            if (err){
                callBack(err);
            }
            else{
                if (versionTarget){
                    self.downloadTarballFromFileDisk(name, versionTarget, function(err, bufferFileDisk){
                        if (bufferFileDisk){
                            callBack(null, bufferFileDisk, versionTarget);
                        }
                        else{
                            //download from http
                            let url = self.baseURL + "/" + name + "/-/" + name + "-" + versionTarget + ".tgz";
                            let headers = self.buildHeaders();
                            self.request(url, headers, function(err, buffer){
                                if (err){
                                    callBack(err);
                                }
                                else{
                                    if (self.enableCacheDisk){
                                        self.saveTarball(name, versionTarget, buffer, function(){
                                            callBack(null, buffer, versionTarget);
                                        });
                                    }
                                    else{
                                        callBack(null, buffer, versionTarget);
                                    }
                                }
                            });
                        }
                    })
                }
                else{
                    callBack(null, null, null);
                }
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

    this.buildHeaders = function(){
        var headers = {};
        headers["user-agent"] = "functions-io";
        return headers;
    };

    this.request = function(url, headers, callBack){
        var data = [];
        var http_request = null;
        var option = urlParse.parse(url);
        option.timeout = 2000;
        option.method = "GET";
        option.headers = headers;
        
        if (option.protocol === "https:"){
            http_request = https;
        }
        else{
            http_request = http;
        }

        var startTime = new Date().getTime();
        var request = http_request.request(option, function(response) {
            if (response.statusCode === 200){
                response.on("data", function(chunk){
                    data.push(chunk);
                });
                response.on("end", function(chunk){
                    var buffer = Buffer.concat(data);
                    
                    //log
                    console.log("get", url, "-", response.statusCode, "-", (new Date().getTime() - startTime) + "ms", "-", Math.round(buffer.length / 1024) + "Kb");
                    
                    callBack(null, buffer);
                });
            }
            else{
                callBack(response.statusCode);
            }
        });
        request.on("timeout", function(res, socket, head) {
            console.log("timeout");
            request.abort();
        });
        request.on("error", function(err) {
            console.log("Erro -> " + err);
            callBack(err);
        });
        request.end();
    };
};

module.exports = HttpNpmDataStore;