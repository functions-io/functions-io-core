"use strict";

const assert = require("assert");
const moduleTest = require("../");

assert.strictEqual(moduleTest(2,3), 5);
assert.strictEqual(moduleTest(2,8), 10);