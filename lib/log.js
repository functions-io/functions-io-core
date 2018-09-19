module.exports.levels = {};
module.exports.levels.OFF = 0;
module.exports.levels.FATAL = 100;
module.exports.levels.ERROR = 200;
module.exports.levels.WARN = 300;
module.exports.levels.INFO = 400;
module.exports.levels.DEBUG = 500;
module.exports.levels.TRACE = 600;

module.exports.level = module.exports.levels.INFO;

module.exports.parseLevel = function(level){
    if (level){
        if (typeof(level) === "string"){
            level.toUpperCase();
            if (level === "OFF"){
                level = module.exports.levels.OFF;
            }
            else if (level === "FATAL"){
                level = module.exports.levels.FATAL;
            }
            else if (level === "ERROR"){
                level = module.exports.levels.ERROR;
            }
            else if (level === "WARN"){
                level = module.exports.levels.WARN;
            }
            else if (level === "DEBUG"){
                level = module.exports.levels.DEBUG;
            }
            else if (level === "TRACE"){
                level = module.exports.levels.TRACE;
            }
            else {
                level = module.exports.levels.INFO;
            }
        }
    }
    else{
        level = module.exports.levels.INFO;
    }
    return level;
};

module.exports.parseLog = function(level, filename, method, message, context){
    var logObj = {};
    logObj.level = level;
    logObj.date = new Date();
    if (filename){
        logObj.filename = filename.substring(filename.lastIndexOf("/") + 1);
    }
    logObj.method = method;
    logObj.message = message;
    if (context){
        logObj.context = {};
        logObj.client = context.client || null;
    }
    return logObj;
};

module.exports.generic = function log(level, filename, method, message, context){
    level = module.exports.parseLevel(level);
    if (module.exports.level >= level){
        module.exports.writelog(module.exports.parseLog(level, filename, method, message, context));
    }
};

module.exports.info = function info(filename, method, message, context){
    module.exports.generic(module.exports.levels.INFO, filename, method, message, context);
};

module.exports.debug = function debug(filename, method, message, context){
    module.exports.generic(module.exports.levels.DEBUG, filename, method, message, context);
};

module.exports.warn = function warn(filename, method, message, context){
    module.exports.generic(module.exports.levels.WARN, filename, method, message, context);
};

module.exports.error = function error(filename, method, message, context){
    module.exports.generic(module.exports.levels.ERROR, filename, method, message, context);
};

module.exports.trace = function trace(filename, method, message, context){
    module.exports.generic(module.exports.levels.TRACE, filename, method, message, context);
};

module.exports.fatal = function fatal(filename, method, message, context){
    module.exports.generic(module.exports.levels.FATAL, filename, method, message, context);
};

module.exports.writelog = function(logObj){
    console.log(JSON.stringify(logObj));
};