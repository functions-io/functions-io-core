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
    this.config.listRegistry = [
        {url:"https://registry.npmjs.org"}
    ];
    this.config.registryCircuitBreakerTimeOut = 10000;
    this.config.requestTimeout = 5000;

    this.getRegistryConfig = function(){
        if (this.config.listRegistry.length > 1){
            for(let i = 0; i < this.config.listRegistry.length; i++) {
                let item = this.config.listRegistry[i];
                if (item.timeError){
                    let now = new Date().getTime();
                    if (now > (item.timeError + this.config.registryCircuitBreakerTimeOut)){
                        item.timeError = null;
                        return item;
                    }
                }
                else{
                    return item;
                }
            }
        }
        else{
            let item = this.config.listRegistry[0];
            if (item.timeError){
                if ((item.timeError + this.config.registryCircuitBreakerTimeOut) > new Date().getTime()){
                    item.timeError = null;
                    return item;
                }
            }
            else{
                return item;
            }
        }
        
        return null;
    };
    
    //npm config set strict-ssl false
    //npm install lodash --registry https://localhost:3000

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
                        //download from http
                        (function(){
                            let headers = self.buildHeaders();
                            
                            function request(){
                                try {
                                    let registryConfig = self.getRegistryConfig(name, version);
                                    if (registryConfig){
                                        let url = registryConfig.url + "/" + name + "/-/" + name + "-" + versionTarget + ".tgz";
                                        self.request(url, headers, function(err, buffer){
                                            if (err){
                                                try {
                                                    if (err instanceof Error){
                                                        registryConfig.timeError = new Date().getTime();
                                                        request();
                                                    }
                                                    else{
                                                        callBack(err);
                                                    }                                                    
                                                }
                                                catch (errTry2) {
                                                    callBack(errTry2);
                                                }
                                            }
                                            else{
                                                callBack(null, buffer, versionTarget);
                                            }
                                        });
                                    }
                                    else{
                                        let errObj = {};
                                        errObj.code = -32000;
                                        errObj.name = "FunctionsErrorDataStoreRequest";
                                        errObj.data = {};
                                        errObj.data.message = "CircuitBreaker";
                                        errObj.data.method = "downloadTarball";
                                        callBack(errObj);
                                    }                                    
                                }
                                catch (errTry) {
                                    callBack(errTry);
                                }
                            }
                    
                            request();
                        })();
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
        var headers = this.buildHeaders();

        //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
        headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*; tarball";

        function request(){
            try {
                let registryConfig = self.getRegistryConfig(name, version);
                if (registryConfig){
                    let url = registryConfig.url + "/" + name + "?v=" + version;
                    self.request(url, headers, function(err, data, responseHeaders){
                        try {
                            if (err){
                                if (err instanceof Error){
                                    registryConfig.timeError = new Date().getTime();
                                    request();
                                }
                                else{
                                    callBack(err);
                                }
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
                        catch (errTry2) {
                            callBack(errTry2);
                        }
                    });
                }
                else{
                    let errObj = {};
                    errObj.code = -32000;
                    errObj.name = "FunctionsErrorDataStoreRequest";
                    errObj.data = {};
                    errObj.data.message = "CircuitBreaker";
                    errObj.data.method = "getModuleManifestOrTarrball";
                    callBack(errObj);
                }                
            }
            catch (errTry) {
                callBack(errTry);
            }
        }

        request();
    };

    this.getModuleManifest = function(name, version, etag, callBack){
        var headers = this.buildHeaders();

        //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
        headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
        if (etag){
            headers["If-None-Match"] = etag;
        }
        
        function request(){
            try {
                let registryConfig = self.getRegistryConfig(name, version);
                if (registryConfig){
                    let url = registryConfig.url + "/" + name;
                    self.request(url, headers, function(err, data, headersResponse){
                        try {
                            if (err){
                                if (err instanceof Error){
                                    registryConfig.timeError = new Date().getTime();
                                    request();
                                }
                                else{
                                    if (err === 304){ //NOT MODIFIED
                                        callBack(null, null);
                                    }
                                    else{
                                        callBack(err);
                                    }
                                }
                            }
                            else{
                                let manifestObj = JSON.parse(data);
                                manifestObj.etag = headersResponse.etag;
                                callBack(null, manifestObj);
                            }                            
                        }
                        catch (errTry2) {
                            callBack(errTry2);
                        }
                    });
                }
                else{
                    let errObj = {};
                    errObj.code = -32000;
                    errObj.name = "FunctionsErrorDataStoreRequest";
                    errObj.data = {};
                    errObj.data.message = "CircuitBreaker";
                    errObj.data.method = "getModuleManifest";
                    callBack(errObj);
                }                
            }
            catch (errTry) {
                callBack(errTry);
            }
        }

        request();
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
        return headers;    
    };

    this.request = function(url, headers, callBack){
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
                        callBack(response.statusCode);
                    }                    
                }
                catch (errTry2) {
                    callBack(errTry2);
                }
            });
            //request.on("timeout", function(res, socket, head) {
            request.on("timeout", function() {
                log.error(__filename, "request", "timeout");
                request.abort();
            });
            request.on("error", function(err) {
                log.error(__filename, "request", err);
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