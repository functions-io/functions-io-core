"use strict";

var assert = require("assert");

module.test = {};

module.before = function(invoke, done){
    done();
}

module.test["test 2 * 3 = 6"] = function(context, done){
    context.invoke(null, "multiply", "1.0.0", {x:2, y:3}, function(err, result){
        assert.equal(err, null);
        assert.equal(result.value, 6);

        done();
    })
};

module.test["test 2 * 8 = 16"] = function(context, done){
    context.invoke(null, "multiply", "1.0.0", {x:2, y:8}, function(err, result){
        assert.equal(err, null);
        assert.equal(result.value, 16);

        done();
    })
};

module.after = function(invoke, done){
    done();
}