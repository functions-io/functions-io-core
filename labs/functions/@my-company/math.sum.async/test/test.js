"use strict";

const assert = require("assert");
const moduleTest = require("../");

assert.strictEqual(moduleTest({x:2,y:3}), 5);
assert.strictEqual(moduleTest({x:2,y:8}), 10);