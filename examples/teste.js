var EventEmitter = require("../lib/EventAsync");

const myEmitter = new EventEmitter();

myEmitter.on('event', function(event){
    event.wait(function(done){
        console.log("evento after 1 async disparado");
        done();
    });
});

myEmitter.on('event', function(event){
    event.wait(function(done){
        console.log("evento after 2 async disparado");
        done();
    });
});

myEmitter.on('event', function(event){
    console.log("evento 1 disparado");
});

myEmitter.on('event', function(event){
    console.log("evento 2 disparado");
});

var data = {};
data.codigo = 1;
data.nome = "fulano 1";

myEmitter.emit("event", data, function(err){
    console.log("fim");
    if (err){
        console.log("Erro => " + err);
    }
});