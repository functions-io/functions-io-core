"use strict";

const log = require("./log");
const parseModuleName = require("./parseModuleName");

var MemoryRepository = function(p_moduleCache){
    var self = this;

    this.listRegistry = [];
    this.cacheListDataStore = new Map();
    this.moduleCache = p_moduleCache || null;
    
    function getKey(moduleName, moduleVersion){
        return moduleName + "@" + moduleVersion;
    }

    this.parseVersion = function(moduleName, moduleVersion){
        var cacheItem = this.cacheListDataStore.get(getKey(moduleName, moduleVersion));
        if (cacheItem){
            return cacheItem.versionTarget || moduleVersion;
        }
        else{
            if (this.moduleCache){
                return this.moduleCache.parseVersion(moduleName, moduleVersion);
            }
            else{
                return moduleVersion;
            }
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
            cacheItem.size = 0;
            
            Object.keys(dataStore).map(function(item){
                cacheItem.size += (dataStore[item].size || 0);
            });
    
            log.info(__filename, "addDataStoreInCache", {moduleName:moduleName, moduleVersion:moduleVersion, versionTarget:versionTarget, size:cacheItem.size});
            
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
            this.getDataStoreInRegistry(moduleName, moduleVersion, false, callBack);
        }
    };
    this.getDataStoreWithoutDownloadDependency = function(moduleName, moduleVersion, callBack){
        var cacheItem = this.getCacheItemInCache(moduleName, moduleVersion);
        if (cacheItem){
            callBack(null, cacheItem.dataStore, cacheItem.versionTarget);
        }
        else{
            this.getDataStoreInRegistry(moduleName, moduleVersion, true, callBack);
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
    this.getDataStoreInRegistry = function(moduleName, moduleVersion, disableDownloadDependency, callBack){
        var cont = 0;
        var moduleNameTarget = parseModuleName(moduleName).moduleName;
        
        function seekDataStore(index){
            let registry = self.listRegistry[index];

            registry.getDataStore(moduleNameTarget, moduleVersion, function(err, dataStore, versionTarget){
                if (err){
                    callBack(err);
                }
                else{
                    if (dataStore){
                        if (disableDownloadDependency){
                            callBack(null, dataStore, versionTarget);
                        }
                        else{
                            self.addDataStoreInCache(moduleNameTarget, moduleVersion, versionTarget, dataStore);
                            self.downloadDependencyDataStore(moduleNameTarget, versionTarget, function(errDownloadDependency){ //download dependencies
                                if (errDownloadDependency){
                                    callBack(errDownloadDependency);
                                }
                                else{
                                    callBack(null, dataStore, versionTarget);
                                }
                            });
                        }
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
                self.getDataStoreInRegistry(nextItem.moduleName, nextItem.moduleVersion, false, function(errGetDataStoreInRegistry){
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
                            if (self.moduleCache && self.moduleCache.getObjectInCache(dependencyModuleName, dependencyModuleVersion)){
                                //object in cache
                            }
                            else{
                                listNextDownload.push({moduleName:dependencyModuleName, moduleVersion:dependencyModuleVersion});
                            }
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