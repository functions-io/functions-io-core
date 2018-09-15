const config = {};

//config.listRegistry = ["https://159.65.165.194:8443", "https://159.65.165.194:8843", "https://registry.npmjs.org"];
//config.listRegistry = ["http://159.65.165.194:8080", "https://159.65.165.194:8843", "https://registry.npmjs.org"];
//config.listRegistry = ["https://127.0.0.1:8443", "https://127.0.0.1:8843", "https://registry.npmjs.org"];
config.listRegistry = ["https://registry.npmjs.org"];

config.log = {};
config.log.levels = {};
config.log.levels.OFF = 0;
config.log.levels.FATAL = 100;
config.log.levels.ERROR = 200;
config.log.levels.WARN = 300;
config.log.levels.INFO = 400;
config.log.levels.DEBUG = 500;
config.log.levels.TRACE = 600;
config.log.level = config.log.levels.INFO;
//config.log.level = config.log.levels.WARN;

config.moduleRegistryDataStore = null;

config.requestTimeout = 5000;

module.exports = config;
//let url = self.baseURL + "/" + name + "/-/" + name + "-" + versionTarget + ".tgz";