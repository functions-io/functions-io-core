# Functions-IO
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Auto reload change in javascript files
  * Input/Output with automatic validation
  * Unit Test with automatic execution
  * Openapi/Swagger definition generated automatically
  * Statistics - access, error, abort, time

## Installation
```bash
$ npm install functions-io
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
var functionsio = require("functions-io");
var app = functionsio();

app.listen(8080);
```

## Catalog API (Openapi / Swagger)
```
http://localhost:8080/catalog
```
## Admin
```
http://localhost:8080/admin
```
## swagger.json
```
http://localhost:8080/swagger.json
```
## Unit Test
```
http://localhost:8080/test
```

## Options property
* isGenerateStatistics (default: true)
* isDisableGenerateHTML (default: false)
* enableCORS (default: false)
* enableCORSFromOrigin (default: *)
* path (default: functions)
* mountpath (default: /)
* unitTest
* * load (default: true)
* * executeOnStart (default: true)
* scan
* * automatic (default: true)
* * interval (default: 1000)
```javascript
//example
var functionsio = require("functions-io");
var app = functionsio({path:"test/functions", enableCORS: true, scan:{automatic:false}});

app.listen(8080);
```