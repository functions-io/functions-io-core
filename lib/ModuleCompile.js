"use strict";

var vm = require("vm");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var ModuleCompile = function(){
    var self = this;

    //this.requireModuleExtend(path, manifest){
    this.requireModuleExtend = function(path){
        return require(path);
    };

    this.compile = function(code, manifest){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        
        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: manifest.filePath,
            lineOffset: 0,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};
        
        var newRequire = function(path){
            return self.requireModuleExtend(path, manifest);
        };
        
        compiledWrapper(newModule.exports, newRequire, newModule, manifest.filePath || manifest.name, "");

        return newModule;
    };
};

module.exports = ModuleCompile;