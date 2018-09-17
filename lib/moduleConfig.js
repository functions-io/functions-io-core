module.exports = function(moduleName, moduleVersion, config){
    var key = moduleName.replace(/@/g,"").replace(/\.|-/g,"_").replace(/\//g,"__").toUpperCase();
    var value = process.env[key];

    if (value){
        let listValues = value.split(",");
        listValues.forEach(function(item){
            let itemList = item.split(":");
            if (config[itemList[0]]){
                config[itemList[0]] = itemList[1];
            }
        });
    }
    
    return config;

    //ex: db_url:127.0.0.1,db_password:
};