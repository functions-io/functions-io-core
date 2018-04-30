var path = require("path");

var FolderDataStore = require("../lib/dataStore/FolderDataStore");

var folderDataStore = new FolderDataStore();

folderDataStore.baseFolder = path.join(process.cwd(), "labs", "functions");;

folderDataStore.getDataStore("@my-company/math.multiply", "1.0.0", function(err, dataStore){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!");

        console.log(dataStore);
    }
});

folderDataStore.getDataStore("@my-company/math.sum", "1.0.0", function(err, dataStore){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!");

        console.log(dataStore);
    }
});