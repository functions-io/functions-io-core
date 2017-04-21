# Functions-IO-Core
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Auto reload change in javascript files
  * Input/Output with automatic validation
  * Unit Test with automatic execution
  * Statistics - access, error, abort, time

## Installation
```bash
$ npm install functions-io-core
```

## Usage
### Create a function in folder functions
```javascript
module.version = "v1";
module.category = "test";
module.summary = "sum";
module.description = "sum x + y";

module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};
```
### Start Server
```javascript
var functionsio = require("functions-io-core");
var app = null;
var config = {};

config.enableStatistics = true;
config.unitTest = {};
config.unitTest.load = false;
config.unitTest.executeOnStart = false;

app = functionsio.createServer(config);

app.start(function(err){
    if (err){
        console.error(err);
    }
    else{
        app.factory.invoke(null, "sum", "v1", {x:2,y:3}, null, function(err, data){
            if (err){
                console.error("err in invoke - " + err);
            }
            else{
                console.log("Call sum(2, 3) = " + data.value);
            }
        });
    }
});
```

## Options property
* enableStatistics (default: true)
* enableSecurity (default: false)
* unitTest
* * load (default: true)
* * executeOnStart (default: true)
* scan
* * automatic (default: true)
* * interval (default: 2000)