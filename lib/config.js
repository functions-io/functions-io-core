const config = {};

config.http = {};
config.http.listRegistry = [
    {url:"http://127.0.0.1:9080"},
    {url:"https://registry.npmjs.org"}
];
config.http.registryCircuitBreakerTimeOut = 10000;

config.moduleRegistryDataStore = null;

config.requestTimeout = 5000;

module.exports = config;
//let url = self.baseURL + "/" + name + "/-/" + name + "-" + versionTarget + ".tgz";