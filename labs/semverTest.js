var httpNpmDataStore = require("../lib/dataStore/httpNpmDataStore");

const semver = require("semver");

var versions = ["1.2.1","1.2.2","1.5.0","2.0.0"]

console.log(semver.valid("^1.1.0"));
console.log(semver.valid("1.X.0"));
console.log(semver.valid("1.x.0"));
console.log(semver.valid("*"));
console.log(semver.valid("1.1.0"));

console.log("^1.1.0", semver.maxSatisfying(versions, "^1.1.0"));
console.log("1", semver.maxSatisfying(versions, "1"));
console.log("2", semver.maxSatisfying(versions, "2"));
console.log("3", semver.maxSatisfying(versions, "3"));