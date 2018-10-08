const path = require("path");
const fs = require("fs");

function seekFolderConfig(){
    let folderScript;
    let folderConfig;

    folderScript = path.dirname(require.main.filename);

    folderConfig = path.join(folderScript, "config");
    if (fs.existsSync(folderConfig)){
        return folderConfig;
    }

    folderConfig = path.join(folderScript, "../", "config");
    if (fs.existsSync(folderConfig)){
        return folderConfig;
    }

    folderConfig = path.join(folderScript, "../../", "config");
    if (fs.existsSync(folderConfig)){
        return folderConfig;
    }

    return null;
}

var Config = function(p_file){
    var self = this;
    var originalConfigObj = null;
    var configByKey = {};

    function processConfig(node, prefix){
        let keys = Object.keys(node);

        for (var i = 0; i < keys.length; i++){
            let fullKey;
            let key = keys[i];
            let item = node[key];

            if (prefix){
                fullKey = prefix + "." + key;
            }
            else{
                fullKey = key;
            }

            if (typeof(item) === "object"){
                configByKey[fullKey] = item;
                processConfig(item, fullKey);
            }
            else{
                let keyEnv = fullKey.toUpperCase().replace(/\./g, "_");
                if (process.env[keyEnv] !== undefined){
                    configByKey[fullKey] = process.env[keyEnv];
                    node[key] = process.env[keyEnv];
                }
                else{
                    configByKey[fullKey] = item;
                }
            }
        }
    }

    this.open = function(p_file){
        let filePath;
        let configFolderPath;
        
        if (p_file){
            if (typeof(p_file) === "object"){
                originalConfigObj = p_file;
                processConfig(originalConfigObj);
            }
            else{
                filePath = p_file;
                if (fs.existsSync(filePath)){
                    originalConfigObj = require(filePath);
                    processConfig(originalConfigObj);
                }
            }
        }
        else{
            configFolderPath = seekFolderConfig();
            if (configFolderPath){
                filePath = path.join(configFolderPath, "default.json");
                if (fs.existsSync(filePath)){
                    originalConfigObj = require(filePath);
                    processConfig(originalConfigObj);
                }
            }
        }
    };

    this.parseValue = function(value, defaultValue){
        if (value === undefined){
            return defaultValue || null;
        }

        return value;
    };

    this.get = function(key, defaultValue){
        return this.parseValue(configByKey[key], defaultValue);
    };

    self.open(p_file);
};

module.exports = Config;