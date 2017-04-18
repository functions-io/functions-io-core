"use strict";

module.name = "sys.stats";
module.category = "sys";
module.summary = "statistic";
module.description = "return statistic";

module.input = {
    stage:{type:"string", required:false},
    name:{type:"string", required:false},
    category:{type:"string", required:false}
};
module.output = {
    list:{type:"array", required:true, items: {
        category:{type:"string", required:true},
        objectName:{type:"string", required:true},
        stage:{type:"string", required:true},
        name:{type:"string", required:true},
        version:{type:"string", required:true},
        summary:{type:"string", required:true},
        hits:{type:"object", required:true, properties: {
            success:{type:"integer", required:true},
            error:{type:"integer", required:true},
            abort:{type:"integer", required:true},
            lastResponseTime:{type:"float", required:true},
            avgResponseTime:{type:"float", required:true},
            maxResponseTime:{type:"float", required:true},
            minResponseTime:{type:"float", required:true}
        }}
    }}
};

module.exports = function(context, message, callBack){
    var listStats = [];
    var item;
    var newItemStats;
    var keys;
    var factory = module._factory;

    keys = Object.keys(factory.listFunctionManager);

    for (var i = 0; i < keys.length; i++){
        item = factory.listFunctionManager[keys[i]];

        newItemStats = {};
        newItemStats.category = item.module.category;
        newItemStats.objectName = item.module.objectName;
        newItemStats.stage = item.stage;
        newItemStats.name = item.name;
        newItemStats.version = item.version;
        newItemStats.summary = item.summary;
        newItemStats.hits = item.hits;
        listStats.push(newItemStats);
    }

    callBack(null, listStats);
};