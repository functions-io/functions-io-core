var assert = require("assert");
var InputValidate = require("../lib/factory/InputValidate");
var inputValidate = new InputValidate();
var now = new Date();

function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

var input1 = {
    code:{type:"integer", required:true},
    name:{type:"string", required:true},
    date:{type:"date", required:true},
    value:{type:"float", required:true},
    option:{type:"string", required:true, enum: ["Male", "Female"]}
};

var input2 = {
    code:{type:"integer", required:true, minimum:0, maximum:9},
    name:{type:"string", required:true, minLength:3, maxLength:9, pattern:/^[a-zA-Z0-9\s]*$/},
    date:{type:"date", required:true},
    value:{type:"float", required:true},
    option:{type:"string", required:true, enum: ["Male", "Female"]},
    listArray1:{type:"array", required:true, minItems:1, maxItems:2, items: {
        code:{type:"integer", required:true, minimum:0, maximum:9},
        name:{type:"string", required:true, minLength:3, maxLength:9, pattern:/^[a-zA-Z0-9\s]*$/},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }},
    listArray2:{type:"array", required:false, minItems:1, maxItems:2, items: {
        code:{type:"integer", required:true, minimum:0, maximum:9},
        name:{type:"string", required:true, minLength:3, maxLength:9, pattern:/^[a-zA-Z0-9\s]*$/},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }},
    obj1:{type:"object", required:true, properties:{
        code:{type:"integer", required:true, minimum:0, maximum:9},
        name:{type:"string", required:true, minLength:3, maxLength:9, pattern:/^[a-zA-Z0-9\s]*$/},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }},
    obj2:{type:"object", required:false, properties:{
        code:{type:"integer", required:true, minimum:0, maximum:9},
        name:{type:"string", required:true, minLength:3, maxLength:9, pattern:/^[a-zA-Z0-9\s]*$/},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }}
};

var input3 = {
    code:{type:"integer", required:true},
    date:{type:"date", required:true},
    value:{type:"float", required:true},
    listArray1:{type:"array", required:false, items: {
        code:{type:"integer", required:true},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        obj1:{type:"object", required:true, properties:{
            code:{type:"integer", required:true},
            date:{type:"date", required:true},
            value:{type:"float", required:true}
        }},
    }},
    obj1:{type:"object", required:true, properties:{
        code:{type:"integer", required:true},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        listArray1:{type:"array", required:false, items: {
            code:{type:"integer", required:true},
            date:{type:"date", required:true},
            value:{type:"float", required:true},
            obj1:{type:"object", required:true, properties:{
                code:{type:"integer", required:true},
                date:{type:"date", required:true},
                value:{type:"float", required:true}
            }},
        }}
    }},
};

var result = null;
var data1 = null, data2 = null, data3 = null;

//
//INPUT 1
//
data1 = {code: 1, name: "name 1", date:now, value:4.5, option:"Male"};
data2 = {code: "1", name: "name 1", date:now.toJSON(), value:"4.5", option:"Male"};

result = inputValidate.parse("function1", data1, input1);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.option, "Male");

result = inputValidate.parse("function1", data2, input1);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);
assert.strictEqual(result.data.option, "Male");


//
//INPUT 2
//
data1.obj1 = {code: 1, name: "name 1", date:now, value:4.5, option:"Male"};
data1.listArray1 = [];
data1.listArray2 = [];
data1.listArray1.push({code: 1, name: "name 1", date:now, value:4.5, option:"Male"});
data1.listArray2.push({code: 1, name: "name 1", date:now, value:4.5, option:"Male"});

data2.obj1 = {code: 1, name: "name 1", date:now, value:4.5, option:"Male"};
data2.listArray1 = [];
data2.listArray2 = [];
data2.listArray1.push({code: "1", name: "name 1", date:now.toJSON(), value:"4.5", option:"Male"});
data2.listArray2.push({code: "1", name: "name 1", date:now.toJSON(), value:"4.5", option:"Male"});

result = inputValidate.parse("function1", data1, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");


result = inputValidate.parse("function1", data2, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");


//
//INPUT 2 + ARRAY + OBJ
//
data1.obj2 = {code: 2, name: "name 2", date:now, value:5.9, option:"Female"};
data1.listArray1.push({code: 2, name: "name 2", date:now, value:5.9, option:"Female"});
data1.listArray2.push({code: 2, name: "name 2", date:now, value:5.9, option:"Female"});
data2.obj2 = {code: "2", name: "name 2", date:now.toJSON(), value:"5.9", option:"Female"};
data2.listArray1.push({code: "2", name: "name 2", date:now.toJSON(), value:"5.9", option:"Female"});
data2.listArray2.push({code: "2", name: "name 2", date:now.toJSON(), value:"5.9", option:"Female"});

result = inputValidate.parse("function1", data1, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.obj2.code, 2);
assert.strictEqual(result.data.obj2.name, "name 2");
assert.strictEqual(result.data.obj2.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj2.option, "Female");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray1[1].code, 2);
assert.strictEqual(result.data.listArray1[1].name, "name 2");
assert.strictEqual(result.data.listArray1[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[1].option, "Female");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");
assert.strictEqual(result.data.listArray2[1].code, 2);
assert.strictEqual(result.data.listArray2[1].name, "name 2");
assert.strictEqual(result.data.listArray2[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[1].option, "Female");


result = inputValidate.parse("function1", data2, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.obj2.code, 2);
assert.strictEqual(result.data.obj2.name, "name 2");
assert.strictEqual(result.data.obj2.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj2.option, "Female");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray1[1].code, 2);
assert.strictEqual(result.data.listArray1[1].name, "name 2");
assert.strictEqual(result.data.listArray1[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[1].option, "Female");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");
assert.strictEqual(result.data.listArray2[1].code, 2);
assert.strictEqual(result.data.listArray2[1].name, "name 2");
assert.strictEqual(result.data.listArray2[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[1].option, "Female");


//
//INPUT 3
//
data3 = {code: "1", date:now.toJSON(), value:"4.5"};
data3.listArray1 = [];
data3.listArray1.push({code: "1", date:now.toJSON(), value:"4.5"});
data3.listArray1[0].obj1 = {code: "1", date:now.toJSON(), value:"4.5"}
data3.obj1 = {code: "1", date:now.toJSON(), value:"4.5", listArray1:[]};
data3.obj1.listArray1.push({code: "1", date:now.toJSON(), value:"4.5"});
data3.obj1.listArray1[0].obj1 = {code: "1", date:now.toJSON(), value:"4.5"};

result = inputValidate.parse("function1", data3, input3);

assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);

assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].value, 4.5);

assert.strictEqual(result.data.listArray1[0].obj1.code, 1);
assert.strictEqual(result.data.listArray1[0].obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].obj1.value, 4.5);

assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.value, 4.5);

assert.strictEqual(result.data.obj1.listArray1[0].code, 1);
assert.strictEqual(result.data.obj1.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.listArray1[0].value, 4.5);

assert.strictEqual(result.data.obj1.listArray1[0].obj1.code, 1);
assert.strictEqual(result.data.obj1.listArray1[0].obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.listArray1[0].obj1.value, 4.5);


//
//INPUT 1 + ERROR
//
var dataErr;

dataErr = clone(data1);
delete dataErr.code;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");

dataErr = clone(data1);
dataErr.code = -1;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 0);

dataErr = clone(data1);
dataErr.code = 10;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
dataErr.code = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not integer");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");

dataErr = clone(data1);
delete dataErr.name;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");

dataErr = clone(data1);
dataErr.name = "aa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 3);

dataErr = clone(data1);
dataErr.name = "aaaaaaaaaa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
dataErr.name = "aaa1*";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 5);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, "^[a-zA-Z0-9\\s]*$");

dataErr = clone(data1);
delete dataErr.date;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
dataErr.date = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not date");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
delete dataErr.value;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
dataErr.value = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not float");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
delete dataErr.option;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

dataErr = clone(data1);
dataErr.option = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not in domain");
assert.strictEqual(result.error.code, 2);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

//obj1

dataErr = clone(data1);
delete dataErr.obj1.code;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");

dataErr = clone(data1);
dataErr.obj1.code = -1;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 0);

dataErr = clone(data1);
dataErr.obj1.code = 10;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
delete dataErr.obj1.name;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");

dataErr = clone(data1);
dataErr.obj1.name = "aa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 3);

dataErr = clone(data1);
dataErr.obj1.name = "aaaaaaaaaa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
dataErr.obj1.name = "aaa1*";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 5);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, "^[a-zA-Z0-9\\s]*$");

dataErr = clone(data1);
delete dataErr.obj1.date;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
dataErr.obj1.date = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not date");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
delete dataErr.obj1.value;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
dataErr.obj1.value = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not float");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
delete dataErr.obj1.option;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

dataErr = clone(data1);
dataErr.obj1.option = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not in domain");
assert.strictEqual(result.error.code, 2);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

dataErr = clone(data1);
dataErr.listArray1.pop();
dataErr.listArray1.pop();
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "listArray1");
assert.strictEqual(result.error.attributeRestriction, 1);

dataErr = clone(data1);
dataErr.listArray1.push({code: 1, name: "name 1", date:now, value:4.5, option:"Male"});
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "listArray1");
assert.strictEqual(result.error.attributeRestriction, 2);

dataErr = clone(data1);
dataErr.listArray2.pop();
dataErr.listArray2.pop();
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "listArray2");
assert.strictEqual(result.error.attributeRestriction, 1);

dataErr = clone(data1);
dataErr.listArray2.push({code: 1, name: "name 1", date:now, value:4.5, option:"Male"});
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "listArray2");
assert.strictEqual(result.error.attributeRestriction, 2);

//listArray1[0]

dataErr = clone(data1);
delete dataErr.listArray1[0].code;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");

dataErr = clone(data1);
dataErr.listArray1[0].code = -1;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 0);

dataErr = clone(data1);
dataErr.listArray1[0].code = 10;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
delete dataErr.listArray1[0].name;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");

dataErr = clone(data1);
dataErr.listArray1[0].name = "aa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 3);

dataErr = clone(data1);
dataErr.listArray1[0].name = "aaaaaaaaaa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
dataErr.listArray1[0].name = "aaa1*";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 5);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, "^[a-zA-Z0-9\\s]*$");

dataErr = clone(data1);
delete dataErr.listArray1[0].date;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
dataErr.listArray1[0].date = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not date");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
delete dataErr.listArray1[0].value;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
dataErr.listArray1[0].value = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not float");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
delete dataErr.listArray1[0].option;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

dataErr = clone(data1);
dataErr.listArray1[0].option = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not in domain");
assert.strictEqual(result.error.code, 2);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

//listArray2[0]

dataErr = clone(data1);
delete dataErr.listArray2[0].code;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");

dataErr = clone(data1);
dataErr.listArray2[0].code = -1;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 0);

dataErr = clone(data1);
dataErr.listArray2[0].code = 10;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "code");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
delete dataErr.listArray2[0].name;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");

dataErr = clone(data1);
dataErr.listArray2[0].name = "aa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 3);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 3);

dataErr = clone(data1);
dataErr.listArray2[0].name = "aaaaaaaaaa";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 4);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, 9);

dataErr = clone(data1);
dataErr.listArray2[0].name = "aaa1*";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.code, 5);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "name");
assert.strictEqual(result.error.attributeRestriction, "^[a-zA-Z0-9\\s]*$");

dataErr = clone(data1);
delete dataErr.listArray2[0].date;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
dataErr.listArray2[0].date = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not date");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "date");

dataErr = clone(data1);
delete dataErr.listArray2[0].value;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
dataErr.listArray2[0].value = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not float");
assert.strictEqual(result.error.code, 1);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "value");

dataErr = clone(data1);
delete dataErr.listArray2[0].option;
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value required");
assert.strictEqual(result.error.code, 0);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");

dataErr = clone(data1);
dataErr.listArray2[0].option = "abc";
result = inputValidate.parse("function1", dataErr, input2);
assert.strictEqual(result.error.name, "ValidateError");
assert.strictEqual(result.error.message, "Value is not in domain");
assert.strictEqual(result.error.code, 2);
assert.strictEqual(result.error.functionName, "function1");
assert.strictEqual(result.error.attributeName, "option");