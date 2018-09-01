"use strict";

var vm = require("vm");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var ModuleCompile = function(){
    var self = this;

    //this.requireModuleExtend = function(moduleName, moduleVersion, fileName, opt){
    this.requireModuleExtend = function(moduleName, moduleVersion, fileName){
        return require(fileName);
    };

    this.requireModule = function(moduleName, moduleVersion, fileName, opt){
        return this.requireModuleExtend(moduleName, moduleVersion, fileName, opt);
    };

    this.compile = function(code, opt){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        
        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: opt.filePath,
            lineOffset: 0,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};
        newModule.moduleName = opt.name;
        newModule.moduleVersion = opt.version;
        newModule.modulePath = opt.filePath;

        var newRequire = function(path){
            return self.requireModule(opt.name, opt.version, path, opt);
        };
        
        compiledWrapper(newModule.exports, newRequire, newModule, opt.filePath || opt.name, "");

        return newModule;
    };
};

module.exports = ModuleCompile;