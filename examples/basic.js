var functionsio = require("../");
var app = functionsio.createServer();
app.config.path = __dirname + "/../test/functions";

app.start(function(err){
    if (err){
        console.log("err:");
        console.error(err);
    }
    else{
        app.functionsInvoke.invoke(null, "sum", "1.0.0", {x:2,y:3}, null, function(err, data){
            if (err){
                console.error("err in invoke - " + err);
            }
            else{
                console.log("Call sum(2, 3) = " + data.value);
            }
        });
    }
});