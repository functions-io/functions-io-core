try{
    console.log("Run test...");
    require("./inputValidateTest");
    require("./factoryTest");
    require("./factoryUnitTest");
    console.log("Ok");
}
catch(err){
    console.error(err);
}