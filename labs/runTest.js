try{
    console.log("Run test...");
    
    require("./functionManager");
    require("./functionManager_invoke");
    require("./inputValidate");

    console.log("Ok");
}
catch(err){
    console.error(err);
}