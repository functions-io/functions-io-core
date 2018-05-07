const http = require("http");
const functionsio = require("../");

const HttpNpmDataStore = require("../lib/dataStore/HttpsNpmDataStore");
var httpNpmDataStore = new HttpNpmDataStore();

const moduleFactory = functionsio.buildModuleFactory();
const port = 8080;
 
const server = http.createServer(function(request, response) {
    var size = 0;
    httpNpmDataStore.downloadTarball("@my-company/service.math", "1.0.0", function(err, buffer){
        if (err){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err.toString());
            response.end();
        }
        else{
            size += buffer.length;
            httpNpmDataStore.downloadTarball("@my-company/math.sum", "1.0.0", function(err2, buffer){
                if (err2){
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(err.toString());
                    response.end();
                }
                else{
                    size += buffer.length;
                    httpNpmDataStore.downloadTarball("@my-company/math.multiply", "1.0.0", function(err3, buffer){
                        if (err3){
                            response.writeHead(500, {"Content-Type": "text/plain"});
                            response.write(err.toString());
                            response.end();
                        }
                        else{
                            size += buffer.length;
                            response.writeHead(200, {"Content-Type": "text/plain"});
                            response.write(size.toString());
                            response.end();
                        }
                    });
                }
            });
        }
    });
})
 
server.listen(port);
console.log("server online in port " + port);