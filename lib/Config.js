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
            try {
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
                    let envValue = process.env[keyEnv];
                    if (envValue !== undefined){
                        if (typeof(node[key]) === "boolean"){
                            if ((envValue === "true") || (envValue === "TRUE")){
                                envValue = true;
                            }
                            if ((envValue === "false") || (envValue === "FALSE")){
                                envValue = false;
                            }
                            if (envValue === "0"){
                                envValue = false;
                            }
                            if (envValue === "1"){
                                envValue = true;
                            }
                        }
                        else if (typeof(node[key]) === "number"){
                            envValue = parseInt(envValue);
                        }
    
                        configByKey[fullKey] = envValue;
                        node[key] = envValue;
                    }
                    else{
                        configByKey[fullKey] = item;
                    }
                }                
            }
            catch (errTry) {
                console.error(__filename, errTry);
            }
        }
    }

    this.open = function(p_file){
        let filePath;
        let configFolderPath = seekFolderConfig();
        
        if (p_file){
            if (typeof(p_file) === "object"){
                originalConfigObj = p_file;
                processConfig(originalConfigObj);
            }
            else{
                if (p_file.indexOf(".") === -1){
                    filePath = path.join(configFolderPath, p_file + ".json");
                }
                else{
                    filePath = path.join(configFolderPath, p_file);
                }
                if (fs.existsSync(filePath)){
                    originalConfigObj = require(filePath);
                    processConfig(originalConfigObj);
                }
            }
        }
        else{
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