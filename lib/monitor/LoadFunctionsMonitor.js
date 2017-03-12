var LoadFunctionsMonitor = function(server, interval){
    var self = this;
    var monitorIdWaitScan = null;

    this.server = server;
    this.interval = interval || 10000;
    
    this.start = function(){
        monitorIdWaitScan = setInterval(function(){self.execute();}, self.interval);
    };

    this.stop = function(){
        if (monitorIdWaitScan){
            clearInterval(monitorIdWaitScan);
            monitorIdWaitScan = null;
        }
    };

    this.execute = function(){
        this.stop();

        this.server.loadFunctions(function(err, data){
            self.start();
        });
    };
};

module.exports = LoadFunctionsMonitor;