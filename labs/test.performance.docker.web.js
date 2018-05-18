const child_process = require("child_process");
const http = require("http");
const port = 8080;

var cont = 0;

const server = http.createServer(function(request, response) {
    try {
        cont ++;
        let runName = "test" + cont.toString();
        let commandRun = "docker run --name " + runName + " -d mathsum";
        let commandClean = "docker rm " + runName;

        let tempo1 = new Date().getTime();
        let responseDocker = child_process.execSync(commandRun).toString();
        let tempo2 = new Date().getTime();

        console.log(responseDocker);

        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write((tempo2 - tempo1).toString());
        response.end();
        console.log("time: ", (tempo2 - tempo1));

        setTimeout(() => {
            console.log("clean image " + runName);
            console.log(child_process.execSync(commandClean).toString());
        }, 50);
    }
    catch (err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err.toString());
        response.end();
    }
})
 
server.listen(port);
console.log("server online in port " + port);