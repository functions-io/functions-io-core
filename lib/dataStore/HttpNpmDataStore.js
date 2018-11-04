"use strict";

//Patch releases: 1.0 or 1.0.x or ~1.0.4
//Minor releases: 1 or 1.x or ^1.0.4
//Major releases: * or x
//https://registry.npmjs.org/[module]

const log = require("../log");
const http = require("http");
const https = require("https");
const urlParse = require("url");
const extractTAR = require("./extractTAR");
const semver = require("semver");

var HttpNpmDataStore = function(){
    var httpKeepAliveAgent = new http.Agent({ keepAlive: true });
    var httpsKeepAliveAgent = new https.Agent({ keepAlive: true });
    var self = this;

    //config
    this.config = {};
    this.config.listRemoteRegistry = {"@default":{master:"https://registry.npmjs.org", slave:"https://registry.npmjs.org", enabled:true}};
    this.config.requestTimeout = 5000;
    this.config.token = "";

    //npm config set strict-ssl false
    //npm install lodash --registry https://localhost:3000

    this.getListURLFromModuleName = function(moduleName, sufix){
        let scopeName = "@default";
        if (moduleName.substring(0,1) === "@"){
            scopeName = moduleName.substring(0, moduleName.indexOf("/"));
        }
        let listURL = [];
        let itemRemote = this.config.listRemoteRegistry[scopeName];
        if (itemRemote === undefined){
            itemRemote = this.config.listRemoteRegistry["@default"];
        }
        if (itemRemote && itemRemote.enabled){
            listURL.push(itemRemote.master + sufix);
            if (itemRemote.slave){
                listURL.push(itemRemote.slave + sufix);
            }
            return listURL;
        }
        else{
            return null;
        }
    };

    this.getDataStore = function(name, version, callBack){
        try {
            this.downloadTarball(name, version, function(err, buffer, versionTarget){
                try {
                    if (err){
                        callBack(err);
                    }
                    else{
                        extractTAR.extractGZ(buffer, function(errExtract, dataStore){
                            callBack(errExtract, dataStore, versionTarget);
                        });
                    }                
                }
                catch (errTry2) {
                    callBack(errTry2);
                }
            });            
        }
        catch (errTry) {
            callBack(errTry);
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
                        let listURL = self.getListURLFromModuleName(name, "/" + name + "/-/" + name + "-" + versionTarget + ".tgz");
                        if (listURL){
                            let headers = self.buildHeaders();
                            self.request(listURL, headers, function(err, buffer){
                                if (err){
                                    callBack(err);
                                }
                                else{
                                    callBack(null, buffer, versionTarget);
                                }
                            });
                        }
                        else{
                            callBack(404);
                        }
                    }
                }
                else{
                    callBack(null, null, null);
                }
            }
        });
    };

    this.getVersionOrTarrball = function(name, version, callBack){
        try {
            if (semver.valid(version)){
                callBack(null, version);
            }
            else{
                this.getModuleManifestOrTarrball(name, version, function(err, manifestOrBuffer, versionTarget){
                    try {
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
                    }
                    catch (errTry2) {
                        callBack(errTry2);
                    }
                });
            }
        }
        catch (errTry) {
            callBack(errTry);
        }
    };
    
    this.getModuleManifestOrTarrball = function(name, version, callBack){
        let listURL = this.getListURLFromModuleName(name, "/" + name + "?v=" + version);
        if (listURL){
            let headers = self.buildHeaders();
            //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
            headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*; tarball";
            this.request(listURL, headers, function(err, data, responseHeaders){
                try {
                    if (err){
                        callBack(err);
                    }
                    else{
                        if ((responseHeaders) && (responseHeaders["x-version"])){
                            callBack(null, data, responseHeaders["x-version"]);
                        }
                        else{
                            let manifestObj = JSON.parse(data);
                            manifestObj.etag = responseHeaders.etag;
                            callBack(null, manifestObj);
                        }
                    }                    
                }
                catch (errTry) {
                    callBack(errTry);
                }
            });
        }
        else{
            callBack(404);
        }
    };

    this.getModuleManifest = function(name, version, etag, callBack){
        let listURL = this.getListURLFromModuleName(name, "/" + name);
        if (listURL){
            let headers = self.buildHeaders();
            //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
            headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
            if (etag){
                headers["If-None-Match"] = etag;
            }
            this.request(listURL, headers, function(err, data, headersResponse){
                try {
                    if (err){
                        if (err === 304){ //NOT MODIFIED
                            callBack(null, null);
                        }
                        else{
                            callBack(err);
                        }
                    }
                    else{
                        let manifestObj = JSON.parse(data);
                        manifestObj.etag = headersResponse.etag;
                        callBack(null, manifestObj);
                    }
                }
                catch (errTry) {
                    callBack(errTry);
                }
            });
        }
        else{
            callBack(404);
        }
    };

    this.getVersion = function(name, version, callBack){
        try {
            if (semver.valid(version)){
                callBack(null, version);
            }
            else{
                this.getModuleManifestOrTarrball(name, version, function(err, manifest){
                    try {
                        if (err){
                            callBack(err);
                        }
                        else{
                            //check tag ????? https://github.com/npm/npm/blob/d46015256941ddfff1463338e3e2f8f77624a1ff/lib/utils/pick-manifest-from-registry-metadata.js
                            let versions = Object.keys(manifest.versions);
                            let resolvedTo = semver.maxSatisfying(versions, version, true);
                            callBack(null, resolvedTo);
                        }
                    }
                    catch (errTry) {
                        callBack(errTry);
                    }
                });
            }
        }
        catch (errTry) {
            callBack(errTry);
        }
    };

    this.buildHeaders = function(){
        var headers = {};
        headers["user-agent"] = "functions-io";
        headers["authorization"] = "Bearer " + this.config.token;
        return headers;
    };

    this.request = function(url, headers, callBack){
        let listURL;
        
        if (Array.isArray(url)){
            listURL = url;
        }
        else{
            listURL = [url];
        }

        var tryRequest = function(tryIndex){
            let tryURL = listURL[tryIndex];

            self._request(tryURL, headers, function(err, data, headersResponse){
                if (err){
                    if (err instanceof Error){
                        if (tryIndex < listURL.length){
                            tryRequest(tryIndex + 1);
                        }
                        else{
                            callBack(err, data, headersResponse);
                        }
                    }
                    else{
                        callBack(err, data, headersResponse);
                    }
                }
                else{
                    callBack(err, data, headersResponse);
                }                            
            });
        };

        tryRequest(0);
    };

    this._request = function(url, headers, callBack){
        try {
            var data = [];
            var http_request = null;
            var option = urlParse.parse(url);
            option.timeout = this.config.requestTimeout;
            option.method = "GET";
            option.headers = headers;
            option.rejectUnauthorized = false;
            
            if (option.protocol === "https:"){
                option.agent = httpsKeepAliveAgent;
                http_request = https;
            }
            else{
                option.agent = httpKeepAliveAgent;
                http_request = http;
            }
    
            var startTime = new Date().getTime();
            var request = http_request.request(option, function(response) {
                try {
                    if (response.statusCode === 200){
                        response.on("data", function(chunk){
                            data.push(chunk);
                        });
                        //response.on("end", function(chunk){
                        response.on("end", function(){
                            try {
                                var buffer = Buffer.concat(data);
                            
                                log.info(__filename, "request", {method:option.method, url:url, statusCode:response.statusCode, responseTime:(new Date().getTime() - startTime), size:buffer.length});
                                
                                callBack(null, buffer, response.headers);
                            }
                            catch (errTry3) {
                                callBack(errTry3);
                            }
                        });
                    }
                    else{
                        log.info(__filename, "request", {method:option.method, url:url, statusCode:response.statusCode, responseTime:(new Date().getTime() - startTime)});
                        callBack(response.statusCode);
                    }                    
                }
                catch (errTry2) {
                    callBack(errTry2);
                }
            });
            request.on("timeout", function() {
                request.abort();
            });
            request.on("error", function(err) {
                log.error(__filename, "request", {code:err.code, message:err.message, url:url, maxTime:self.config.requestTimeout});
                callBack(err);
            });
            request.end();
        }
        catch (errTry) {
            callBack(errTry);
        }
    };
};

module.exports = HttpNpmDataStore;