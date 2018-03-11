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

### Example
```javascript
const moduleFactory = require("functions-io-core").buildModuleFactory();

moduleFactory.requireAsync("uuid", "3.2.1")
    .then(function(module){
        console.log("module", module.v4());
        console.log("module", module.v4());
        console.log("module", module.v4());
    }).catch(function(err){
        console.log("erro", err);
    });
```