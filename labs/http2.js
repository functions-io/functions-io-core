"use strict";

const http2 = require("http2");
const urlParse = require("url");
const config = require("../lib/config");

var data = [];
var http_request = null;
var option = urlParse.parse(config.listRegistry[1]);
var optionRequest = {};

option.url = option.protocol + "//" + option.host;

var optionRequest = {}
optionRequest.timeout = 2000;
optionRequest[":method"] = "GET";
optionRequest[":path"] = option.path;
//optionRequest.rejectUnauthorized = false;

//let client = http2.connect('http://localhost:8000');
let client = http2.connect(option.url, {rejectUnauthorized:false});

http_request = client.request(optionRequest);
http_request.on("response", function(responseHeaders) {
    console.log("response", responseHeaders);
});
http_request.on("data", function(chunk) {
    data.push(chunk);
});
http_request.on("end", function(){
    var buffer = Buffer.concat(data);
    console.log(buffer);
    client.destroy();
})

/*
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
*/