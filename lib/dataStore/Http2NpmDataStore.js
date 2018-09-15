"use strict";

const http2 = require("http2");
const urlParse = require("url");
const extractTAR = require("./extractTAR");
const semver = require("semver");
const config = require("../config");

const { NGHTTP2_CANCEL } = http2.constants;

var Http2NpmDataStore = function(){
    var self = this;
    var lastEvent = new Date().getTime();
    var client_cache = null;
    var client_cache_monitorID = null;

    this.baseURL = config.listRegistry[1];
    
    this.getClient = function(option){
        if (client_cache){
            return client_cache;
        }
        else{
            let optionConnect = {};
            optionConnect.rejectUnauthorized = false;
            optionConnect.settings = {};
            //optionConnect.settings.initialWindowSize = 65535;
            //optionConnect.maxSessionMemory = 10;
            client_cache = http2.connect(option.url, optionConnect);

            /*
            client_cache.on("altsvc", function(alt, origin, streamId) {
                console.log("alt", alt);
                console.log("origin", origin);
                console.log("streamId", streamId);
            });
            */

            client_cache.on("error", function(err){
                console.error("client error -> ", err);
            });

            client_cache_monitorID = setInterval(function(){
                let now = new Date().getTime();
                if ((now - lastEvent) > 60000){ //60 seconds
                    self.close();
                }
            }, 10000); //10 seconds

            return client_cache;
        }
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
        });
    };

    this.getModuleManifestOrTarrball = function(name, version, callBack){
        var url = this.baseURL + "/" + name + "?v=" + version;

        var headers = this.buildHeaders();

        //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
        headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*; tarball";
        
        this.request(url, headers, function(err, data, responseHeaders){
            if (err){
                callBack(err);
            }
            else{
                if ((responseHeaders) && (responseHeaders["x-version"])){
                    callBack(null, data, responseHeaders["x-version"]);
                }
                else{
                    callBack(null, JSON.parse(data));
                }
            }
        });
    };
    
    this.getModuleManifest = function(name, callBack){
        var url = this.baseURL + "/" + name;

        var headers = this.buildHeaders();

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

    this.getVersionOrTarrball = function(name, version, callBack){
        if (semver.valid(version)){
            callBack(null, version);
        }
        else{
            this.getModuleManifestOrTarrball(name, version, function(err, manifestOrBuffer, versionTarget){
                if (err){
                    callBack(err);
                }
                else{
                    if (Buffer.isBuffer(manifestOrBuffer)){
                        callBack(null, versionTarget, manifestOrBuffer);
                    }
                    else{
                        //check tag ????? https://github.com/npm/npm/blob/d46015256941ddfff1463338e3e2f8f77624a1ff/lib/utils/pick-manifest-from-registry-metadata.js
                        let versions = Object.keys(manifestOrBuffer.versions);
                        let resolvedTo = semver.maxSatisfying(versions, version, true);
                        callBack(null, resolvedTo);
                    }
                }
            });
        }
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
                    let versions = Object.keys(manifest.versions);
                    let resolvedTo = semver.maxSatisfying(versions, version, true);
                    callBack(null, resolvedTo);
                }
            });
        }
    };

    this.downloadTarball = function(name, version, callBack){
        this.getVersionOrTarrball(name, version, function(err, versionTarget, tarballBuffer){
            if (err){
                callBack(err);
            }
            else{
                if (versionTarget){
                    if (tarballBuffer){
                        callBack(null, tarballBuffer, versionTarget);
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
                                callBack(null, buffer, versionTarget);
                            }
                        });
                    }
                }
                else{
                    callBack(null, null, null);
                }
            }
        });
    };

    this.buildHeaders = function(){
        var headers = {};
        headers["user-agent"] = "functions-io";
        return headers;
    };

    this.request = function(url, headers, callBack){
        let data = [];
        let optionRequest = {};
        let statusCode = null;
        let option = urlParse.parse(url);

        //lastEventes that the maximum amount of padding, as determined by the internal implementation, is to be applied.
        lastEvent = new Date().getTime();

        option.url = option.protocol + "//" + option.host;
        
        optionRequest[":method"] = "GET";
        optionRequest[":path"] = option.path;
        
        var startTime = new Date().getTime();

        let client = this.getClient(option);
        let http_request = client.request(optionRequest);
        http_request.on("response", function(responseHeaders) {
            statusCode = responseHeaders[":status"];
            //console.log("response", responseHeaders);.setTimeout
        });
        http_request.on("data", function(chunk) {
            data.push(chunk);
        });
        http_request.on("end", function(){
            var buffer = Buffer.concat(data);

            //log
            console.log("get", url, "-", statusCode, "-", (new Date().getTime() - startTime) + "ms", "-", Math.round(buffer.length / 1024) + "Kb");
            
            if (statusCode === 200){
                callBack(null, buffer);
            }
            else{
                callBack(statusCode);
            }
        });
        http_request.setTimeout(config.requestTimeout, function(){
            http_request.close(NGHTTP2_CANCEL);
            console.log("request timeout");
        });
        http_request.on("error", function(err) {
            console.log("request erro -> " + err);
        });
        http_request.on("close", function() {
            console.log("request close");
        });
        http_request.on("aborted", function() {
            console.log("request aborted");
        });
    };

    this.close = function(){
        if (client_cache){
            try {
                client_cache.close();
            }
            catch (error) {
                console.log(error);
            }
            try {
                client_cache.destroy();
            }
            catch (error) {
                console.log(error);
            }
            client_cache = null;
            clearInterval(client_cache_monitorID);
            client_cache_monitorID = null;
            console.log("client close");
        }
    };
};

module.exports = Http2NpmDataStore;