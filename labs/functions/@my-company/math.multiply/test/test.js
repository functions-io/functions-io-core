"use strict";

const assert = require("assert");
const moduleTest = require("../");

assert.strictEqual(moduleTest(2,3), 6);
assert.strictEqual(moduleTest(2,8), 16);