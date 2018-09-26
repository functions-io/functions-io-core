module.exports = function(moduleName, fileName){
    var listToken = moduleName.split("/");
    var responseObj = {};

    fileName = fileName || "";

    if (moduleName.substring(0,1) === "@"){
        if (listToken.length > 2){ //@my-company/module/v4
            responseObj.moduleName = listToken[0] + "/" + listToken[1];
            if (fileName){
                responseObj.fileName = listToken[2] + "/" + fileName;
            }
            else{
                responseObj.fileName = listToken[2];
            }
        }
        else{ //@my-company/module
            responseObj.moduleName = moduleName;
            responseObj.fileName = fileName;
        }
    }
    else{
        if (listToken.length > 1){ //module/v4
            responseObj.moduleName = listToken[0];
            if (fileName){
                responseObj.fileName = listToken[1] + "/" + fileName;
            }
            else{
                responseObj.fileName = listToken[1];
            }
        }
        else{
            responseObj.moduleName = moduleName;
            responseObj.fileName = fileName;
        }
    }

    return responseObj;
};