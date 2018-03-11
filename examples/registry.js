const http = require('https');
const fs = require("fs");
//const path = require("path");

const options = {
    key: fs.readFileSync('examples/key.pem'),
    cert: fs.readFileSync('examples/cert.pem'),
    passphrase: '1234'
};

const server = http.createServer(options, function(request, response) {
    let body = [];

    console.log(request.method);
    console.log(request.headers);
    console.log(request.url);
    
    request.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body);
        fs.writeFileSync("/tmp/teste1/dados.dat", body);

        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.write("{}");

        response.end();
    });
});

server.listen(3000);