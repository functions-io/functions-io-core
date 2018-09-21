const HttpNpmDataStore = require("../../lib/dataStore/HttpNpmDataStore");

var httpNpmDataStore = new HttpNpmDataStore();

const semver = require("semver");

httpNpmDataStore.getModuleManifest("async", function(err, manifest){
    if (err){
        console.log(err);
    }
    else{
        console.log("pronto!");
        
        console.log(manifest["dist-tags"].latest);
        //console.log(manifest.versions);
        var versions = Object.keys(manifest.versions);

        console.log("^1.1.0", semver.maxSatisfying(versions, "^1.1.0"));
        console.log("1.5.0", semver.maxSatisfying(versions, "1.5.0"));
        console.log("1.5.*", semver.maxSatisfying(versions, "1.5.*"));
        console.log("^1.5.0", semver.maxSatisfying(versions, "^1.5.0"));
        console.log("1.1.*", semver.maxSatisfying(versions, "1.1.*"));
        console.log("1", semver.maxSatisfying(versions, "1"));
        console.log("2.1", semver.maxSatisfying(versions, "2.1"));
        console.log("2.x", semver.maxSatisfying(versions, "2.x"));
        
        console.log("valido:", semver.valid("2.0.5"));

        //console.log(semver.maxSatisfying(versions, "latest", true));
    }
});