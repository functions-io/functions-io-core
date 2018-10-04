"use strict";

const vm = require("vm");

const wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

function buildSandBox(){
    var sandBox = {};
    
    sandBox = {};
    
    sandBox.global = {};
    sandBox.process = {};
    sandBox.process.env = {};
    sandBox.process.hrtime = process.hrtime;
    sandBox.process.memoryUsage = process.memoryUsage;
    sandBox.process.cpuUsage = process.cpuUsage;
    sandBox.process.nextTick = process.nextTick;
    sandBox.process.pid = process.pid;
    sandBox.process.platform = process.platform;
    sandBox.process.cwd = function(){
        return "";
    };

    //sandBox.process.on
    //sandBox.process.once
    //sandBox.process.listeners
    //sandBox.process.removeListener
    //sandBox.process.umask

    sandBox.clearImmediate = global.clearImmediate;
    sandBox.clearInterval = global.clearInterval;
    sandBox.clearTimeout = global.clearTimeout;
    sandBox.setImmediate = global.setImmediate;
    sandBox.setInterval = global.setInterval;
    sandBox.setTimeout = global.setTimeout;

    sandBox.Buffer = global.Buffer;

    sandBox.console = global.console;
  
    return sandBox;
}


var ModuleCompile = function(){
    var self = this;
    var sandbox = buildSandBox();
    
    vm.createContext(sandbox);

    //this.requireModuleExtend(path, manifest){
    this.requireModuleExtend = function(path){
        return require(path);
    };

    this.compile = function(code, manifest){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        
        var compiledWrapper = vm.runInNewContext(codeWrapper, sandbox, {
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