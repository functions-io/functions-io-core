"use strict";

//types => integer, long, float, double, string, byte, binary, boolean, date, dateTime, password

module.input = {
    code:{type:"integer", required:true}
};
module.output = {
    code:{type:"integer", required:true},
    name:{type:"string", required:true},
    date:{type:"date", required:true},
    sex:{type:"string", required:true, enum: ["Male", "Female"]},
    address:{type:"object", required:true, properties:{addressLocality:{type:"string", required:true}, postalCode:{type:"string", required:true}, streetAddress:{type:"string", required:true}}},
    listChildren:{type:"array", required:true, items: {
        code:{type:"integer", required:true},
        name:{type:"string", required:true}        
    }}
};

module.exports = function(context, message, callBack){
    var person = {};
    person.code = message.code;
    person.name = "person " + message.code;
    person.date = new Date();
    person.sex = "Male";
    person.address = {addressLocality: "local", postalCode: "0000", streetAddress:"address"};
    person.listChildren = [{code: 1, name: "child 1"}, {code: 2, name: "child 2"}]
    
    callBack(null, person);
};