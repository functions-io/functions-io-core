"use strict";

const log = require("./log");

var MemoryRepository = function(){
    var self = this;

    this.listRegistry = [];
    this.cacheListDataStore = new Map();
    
    function getKey(moduleName, moduleVersion){
        return moduleName + "@" + moduleVersion;
    }

    this.parseVersion = function(moduleName, moduleVersion){
        var cacheItem = this.cacheListDataStore.get(getKey(moduleName, moduleVersion));
        if (cacheItem){
            return cacheItem.versionTarget || moduleVersion;
        }
        else{
            return moduleVersion;
        }
    };

    this.addRegistryDataStore = function(registryObj, isPriority){
        if (isPriority){
            this.listRegistry.unshift(registryObj);
        }
        else{
            this.listRegistry.push(registryObj);
        }
    };

    this.addDataStoreInCache = function(moduleName, moduleVersion, versionTarget, dataStore){
        if (dataStore){
            var cacheItem = {};
            cacheItem.moduleName = moduleName;
            cacheItem.moduleVersion = moduleVersion;
            cacheItem.versionTarget = versionTarget;
            cacheItem.lastAccess = new Date();
            cacheItem.create = new Date();
            cacheItem.countAccess = 0;
            cacheItem.dataStore = dataStore;
    
            log.info(__filename, "addDataStoreInCache", {moduleName:moduleName, moduleVersion:moduleVersion, versionTarget:versionTarget});
            
            this.cacheListDataStore.set(getKey(moduleName, moduleVersion), cacheItem);
            if (moduleVersion !== versionTarget){
                this.cacheListDataStore.set(getKey(moduleName, versionTarget), cacheItem);
            }
        }
    };

    this.removeDataStoreInCache = function(moduleName, moduleVersion){
        log.info(__filename, "removeDataStoreInCache", {moduleName:moduleName, moduleVersion:moduleVersion});

        return this.cacheListDataStore.delete(getKey(moduleName, moduleVersion));
    };

    //cache or registry
    this.getDataStore = function(moduleName, moduleVersion, callBack){
        var cacheItem = this.getCacheItemInCache(moduleName, moduleVersion);
        if (cacheItem){
            callBack(null, cacheItem.dataStore, cacheItem.versionTarget);
        }
        else{
            this.getDataStoreInRegistry(moduleName, moduleVersion, callBack);
        }
    };

    //cache only
    this.getDataStoreInCache = function(moduleName, moduleVersion){
        var cacheItem = this.getCacheItemInCache(moduleName, moduleVersion);
        if (cacheItem){
            return cacheItem.dataStore;
        }
        else{
            return null;
        }
    };

    //cache only
    this.getCacheItemInCache = function(moduleName, moduleVersion){
        var cacheItem = this.cacheListDataStore.get(getKey(moduleName, moduleVersion));
        if (cacheItem){
            cacheItem.lastAccess = new Date();
            cacheItem.countAccess ++;

            log.debug(__filename, "getDataStoreInCache", {moduleName:moduleName, moduleVersion:moduleVersion, countAccess:cacheItem.countAccess});

            return cacheItem;
        }
        else{
            return null;
        }
    };

    //response callBack(err, dataStore, versionTarget)
    this.getDataStoreInRegistry = function(moduleName, moduleVersion, callBack){
        var cont = 0;

        function seekDataStore(index){
            let registry = self.listRegistry[index];

            registry.getDataStore(moduleName, moduleVersion, function(err, dataStore, versionTarget){
                if (err){
                    callBack(err);
                }
                else{
                    if (dataStore){
                        self.addDataStoreInCache(moduleName, moduleVersion, versionTarget, dataStore);
                        self.downloadDependencyDataStore(moduleName, versionTarget, function(errDownloadDependency){ //download dependencies
                            if (errDownloadDependency){
                                callBack(errDownloadDependency);
                            }
                            else{
                                callBack(null, dataStore, versionTarget);
                            }
                        });
                    }
                    else{
                        if (index < self.listRegistry.length){
                            cont ++;
                            seekDataStore(cont);
                        }
                        else{
                            callBack(null, null);
                        }
                    }
                }
            });
        }

        if (self.listRegistry.length){
            seekDataStore(0);
        }
        else{
            callBack(null, null);
        }
    };

    this.downloadDependencyDataStore = function(moduleName, moduleVersion, callBack){
        var dataStore = this.getDataStoreInCache(moduleName, moduleVersion);
        var listNextDownload = [];

        function processNextDependency(){
            if (listNextDownload.length){
                var nextItem = listNextDownload.pop();
                self.getDataStoreInRegistry(nextItem.moduleName, nextItem.moduleVersion, function(errGetDataStoreInRegistry){
                    if (errGetDataStoreInRegistry){
                        callBack(null, errGetDataStoreInRegistry);
                    }
                    else{
                        processNextDependency();
                    }
                });
            }
            else{
                callBack(null);
            }
        }

        if (dataStore){
            let itemStore = dataStore["package.json"];
            if (itemStore){
                let packageObj = JSON.parse(itemStore.payload);
                if (packageObj.dependencies){
                    let listKeys = Object.keys(packageObj.dependencies);
                    //let listNextDownload = [];
                    
                    listKeys.map(function(item){
                        let dependencyModuleName = item;
                        let dependencyModuleVersion = packageObj.dependencies[dependencyModuleName];
    
                        if (self.getDataStoreInCache(dependencyModuleName, dependencyModuleVersion) === null){
                            listNextDownload.push({moduleName:dependencyModuleName, moduleVersion:dependencyModuleVersion});
                        }
                    });

                    if (listNextDownload.length){
                        processNextDependency();
                    }
                    else{
                        callBack(null);
                    }
                }
                else{
                    callBack(null);
                }
            }
            else{
                callBack(null);
            }
        }
        else{
            callBack("Module " + moduleName + ":" + moduleVersion + " not found.");
        }
    };

    this.getFileBuffer = function(moduleName, moduleVersion, fileName, callBack){
        this.getDataStore(moduleName, moduleVersion, function(err, dataStore){
            if (err){
                callBack(err);
            }
            else{
                var payload = self.getFileBufferInDataStore(dataStore, fileName);
                callBack(null, payload);
            }
        });
    };

    this.getFileBufferInCache = function(moduleName, moduleVersion, fileName){
        var dataStore = this.getDataStoreInCache(moduleName, moduleVersion);
        if (dataStore){
            return this.getFileBufferInDataStore(dataStore, fileName);
        }
        else{
            return null;
        }
    };

    this.getFileBufferInDataStore = function(dataStore, fileName){
        if (dataStore){
            if (fileName.substring(0,1) === "/"){
                fileName = fileName.substring(1);
            }
            else if (fileName.substring(0,2) === "./"){
                fileName = fileName.substring(2);
            }

            var item = dataStore[fileName];
            
            if (item){
                return item.payload;
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    };
};

module.exports = MemoryRepository;