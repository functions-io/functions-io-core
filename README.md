# Functions-IO-Core
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Input/Output with automatic validation

## Installation
```bash
$ npm install functions-io-core
```

## Usage
### Create a subfolder in functions folder and generate package.json
```bash
$ npm init
```

### example package.json
```json
{
  "name": "sum",
  "version": "1.0.0",
  "description": "sum x + y",
  "main": "index.js"
}
```

### create file index.js

```javascript
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

## example full package.json
```json
{
  "name": "multiply",
  "version": "1.0.0",
  "description": "multiply x * y",
  "category": "test",
  "main": "index.js",
  "test": "test.js",
}
```

## Events
* PRE_INVOKE
* POS_INVOKE
* PRE_LOAD_FUNCTION
* POS_UNLOAD_FUNCTION