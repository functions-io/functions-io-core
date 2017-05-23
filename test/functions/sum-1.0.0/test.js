"use strict";

var assert = require("assert");


module.test = {};

module.test["test 2 + 3 = 5"] = function(invoke, done){
    invoke(null, "sum", "v1", {x:2, y:3}, function(err, result){
        assert.equal(err, null);
        assert.equal(result.value, 5);

        done();
    })
};

module.test["test 2 + 8 = 10"] = function(invoke, done){
    invoke(null, "sum", "v1", {x:2, y:8}, function(err, result){
        assert.equal(err, null);
        assert.equal(result.value, 10);

        done();
    })
};