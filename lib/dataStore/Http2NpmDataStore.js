"use strict";

const os = require("os");
const fs = require("fs");
const http2 = require("http2");
const urlParse = require("url");
const extractTAR = require("./extractTAR");
const semver = require("semver");
const config = require("../config");

var Http2NpmDataStore = function(){
    var self = this;

    this.baseURL = config.listRegistry[1];
    
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

    this.downloadTarball = function(name, version, callBack){
        this.getVersion(name, version, function(err, versionTarget){
            if (err){
                callBack(err);
            }
            else{
                if (versionTarget){
                    //download from http
                    let url = self.baseURL + "/" + name + "/-/" + name + "-" + versionTarget + ".tgz";
                    let headers = self.buildHeaders();
                    self.request(url, headers, function(err, buffer){
                        if (err){
                            callBack(err);
                        }
                        else{
                            callBack(null, buffer, versionTarget);
                        }
                    });
                }
                else{
                    callBack(null, null, null);
                }
            }
        })
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
        var optionRequest = {};
        
        var optionRequest = {}
        optionRequest.timeout = 2000;
        optionRequest[":method"] = "GET";
        optionRequest[":path"] = option.path;
        option.headers = headers;
        option.rejectUnauthorized = false;
        
        option.timeout = 2000;
        option.method = "GET";
        option.headers = headers;
        option.rejectUnauthorized = false;
        
        
        var startTime = new Date().getTime();

        //let client = http2.connect('http://localhost:8000');
        let client = http2.connect(option.url);
        let req = client.request({ ':method': 'GET', ':path': '/' });
        req.on('response', (responseHeaders) => {
          // do something with the headers
        });
        req.on('data', (chunk) => {
          // do something with the data
        });
        req.on('end', () => client.destroy())

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

module.exports = Http2NpmDataStore;