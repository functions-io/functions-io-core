const semver = require("semver");

var versions = ["3.1.6"];

console.log("^1.0.0", semver.maxSatisfying(versions, "^1.0.0"));
console.log("^2.0.0", semver.maxSatisfying(versions, "^2.0.0"));
console.log("^3.0.0", semver.maxSatisfying(versions, "^3.0.0"));
console.log("3", semver.maxSatisfying(versions, "3"));
console.log("3.2.0", semver.maxSatisfying(versions, "3.2.0"));
console.log("^3.2.0", semver.maxSatisfying(versions, "^3.2.0"));
console.log("4", semver.maxSatisfying(versions, "4"));