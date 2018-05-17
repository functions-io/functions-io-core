const http = require("http");
const functionsio = require("../");
const port = 8080;
const httpDataStore = functionsio.createHttpNpmDataStore();
const http2DataStore = functionsio.createHttp2NpmDataStore();
 
const server = http.createServer(function(request, response) {
    let dataStore = null;
    let moduleName = request.url.substring(1);
    if (moduleName){
        let tmpPathArray = moduleName.split("?");
        moduleName = tmpPathArray[0];
        if (tmpPathArray.length){
            if (tmpPathArray[1] === "http2"){
                dataStore = http2DataStore;
            }
            else{
                dataStore = httpDataStore;
            }
        }
    }
    else{
        moduleName = "@performance1/service.math.0";
    }

    let memoryRegistry = functionsio.createMemoryRegistry();
    memoryRegistry.addRegistryDataStore(dataStore);
    let moduleFactory = functionsio.createModuleFactory(memoryRegistry);

    let tempo1 = new Date().getTime();
    moduleFactory.requireAsync(moduleName, "1")
        .then(function(moduleObj){
            let tempo2 = new Date().getTime();

            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write((tempo2 - tempo1).toString());
            response.end();

            console.log("time: ", (tempo2 - tempo1));
        }).catch(function(err){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err.toString());
            response.end();
            console.log("erro", err);
        });
})
 
server.listen(port);
console.log("server online in port " + port);