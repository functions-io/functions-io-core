"use strict";


const http2 = require("http2");
const urlParse = require("url");
const config = require("../../lib/config");

var data = [];
var option = urlParse.parse(config.listRegistry[1]);
var optionRequest = {};

option.url = option.protocol + "//" + option.host;

optionRequest.timeout = 2000;
optionRequest[":method"] = "GET";
optionRequest[":path"] = option.path;
//optionRequest.rejectUnauthorized = false;

//let client = http2.connect('http://localhost:8000');
let client = http2.connect(option.url, {rejectUnauthorized:false});

function request(client, optionRequest, callBack){
    let http_request = client.request(optionRequest);
    http_request.on("response", function(responseHeaders) {
        console.log("response", responseHeaders);
    });
    http_request.on("data", function(chunk) {
        data.push(chunk);
    });
    http_request.on("end", function(){
        var buffer = Buffer.concat(data);
        callBack(null, buffer);
    });
}

request(client, optionRequest, function(err, data){
    var fs = require("fs");
    fs.writeFileSync("/tmp/teste1.tgz", data);
    console.log(err, data);
});
request(client, optionRequest, function(err, data){
    console.log(err, data);
});