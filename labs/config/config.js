const Config = require("../../lib/Config");
const config = new Config();

console.log(config.get("registry.endPoint.http.port"));