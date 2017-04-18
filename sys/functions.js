"use strict";

module.name = "sys.functions";
module.category = "sys";
module.summary = "functions loaded";
module.description = "return functions loaded";

module.output = {
    list:{type:"array", required:true, items: {
        category:{type:"string", required:true},
        objectName:{type:"string", required:true},
        stage:{type:"string", required:true},
        name:{type:"string", required:true},
        version:{type:"string", required:true},
        summary:{type:"string", required:true}
    }}
};

module.exports = function(context, message, callBack){
    var listFunctions = [];
    var item;
    var newItem;
    var keys;
    var factory = module._factory;

    keys = Object.keys(factory.listFunctionManager);

    for (var i = 0; i < keys.length; i++){
        item = factory.listFunctionManager[keys[i]];

        if ((item.module.category !== "sys") && (item.module.category !== "unitTest")){
            newItem = {};
            newItem.category = item.module.category;
            newItem.objectName = item.module.objectName;
            newItem.stage = item.stage;
            newItem.name = item.name;
            newItem.version = item.version;
            newItem.summary = item.summary;

            listFunctions.push(newItem);
        }
    }

    callBack(null, listFunctions);
};