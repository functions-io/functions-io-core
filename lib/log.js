const config = require("./config");

function parseLog(level, filename, method, message){
    var logObj = {};
    logObj.level = level;
    logObj.date = new Date();
    logObj.filename = filename;
    logObj.method = method;
    logObj.message = message;
    return logObj;
}

module.exports.info = function info(filename, method, message){
    if (config.log.level >= config.log.levels.INFO){
        module.exports.writelog(parseLog("INFO", filename, method, message));
    }
}

module.exports.debug = function debug(filename, method, message){
    if (config.log.level >= config.log.levels.DEBUG){
        module.exports.writelog(parseLog("DEBUG", filename, method, message));
    }
}

module.exports.error = function error(filename, method, message){
    if (config.log.level >= config.log.levels.ERROR){
        module.exports.writelog(parseLog("ERROR", filename, method, message));
    }
}

module.exports.writelog = function(logObj){
    console.log(JSON.stringify(logObj));
}