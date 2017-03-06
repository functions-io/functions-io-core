var http = require("http");
var args = process.argv.slice(2);
var file = args[0];
var dirBase = "functions";
var name = "";
var path = "";

name = file.substring(dirBase.length);
name = name.substring(1, name.length - 3);
name = name.replace(/\//g,".");

path = "/" + name + "/?stage=_unitTest";

function httpPost(path, callBack){
    var options = {host: "127.0.0.1", port: "8080", path: path, method: "POST", headers: {"Content-Type": "application/json"}};
    
    var req = http.request(options, function(res) {
        var data = "";
        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            data += chunk; 
        });
        res.on("end", function () {
            if (res.statusCode === 200){
                callBack(null, JSON.parse(data));
            }
            else{
                callBack(res.statusCode, JSON.parse(data));
            }
        });
        res.on("error", function(e) {
            console.log("problem with request: " + e);
        });
    });
    
    req.end();
}

httpPost(path, function(errHTTP, dataHTTP){
    if (errHTTP){
        console.log(errHTTP);
    }
    else{
        if (dataHTTP.result && dataHTTP.result.success){
            console.log("unit test - OK");
            for (var i = 0; i < dataHTTP.result.listResult.length; i++){
                var item = dataHTTP.result.listResult[i];
                if (item.success){
                    console.log(item.success + " - " + item.description + " - " + item.time);
                }
                else{
                    console.log(item.success + " - " + item.description + " - " + item.time + " - " + item.error);
                }
            }
        }
        else{
            console.log("unit test - FAIL");
        }
    }
});