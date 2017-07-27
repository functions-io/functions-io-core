"use strict";

var vm = require("vm");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsCompile = function(){
    this.compile = function(code, opt){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        var name = "functions";
        var filePATH = "functions";

        if (opt){
            if (opt.name){
                name = opt.name;
            }
            if (opt.file){
                filePATH = opt.fileMain || opt.file;
            }
        }

        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: filePATH,
            lineOffset: 0,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};

        var newRequire = function(path){
            if (path.substring(0,1) === "/"){
                if (opt.basePATH){
                    path = opt.basePATH + "/" + path;
                }
            }
            else if (path.substring(0,2) === "./"){
                if (opt.dirPATH){
                    path = opt.dirPATH + "/" + path.substring(2);
                }
            }
            return require(path);
        }

        compiledWrapper(newModule.exports, newRequire, newModule, name, filePATH);

        return newModule;
    };
};

module.exports = FunctionsCompile;