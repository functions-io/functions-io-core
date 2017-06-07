try{
    console.log("Run test...");
    
    require("./functionManager");
    require("./functionManager_stats");
    require("./functionManager_invoke");
    require("./inputValidate");
    require("./functionManager_invoke_test");
    require("./functionManager_invoke_test2");

    console.log("Ok");
}
catch(err){
    console.error(err);
}