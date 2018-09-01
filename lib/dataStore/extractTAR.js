"use strict";

var zlib = require("zlib");

var ExtractTAR = function(){
    var self = this;

    this.extractGZ = function(bufferGZ, callBack){
        zlib.unzip(bufferGZ, { finishFlush: zlib.constants.Z_SYNC_FLUSH }, function(err, buffer){
            if (err){
                callBack(err);
            }
            else{
                callBack(null, self.parseBuffer(buffer));
            }
        });
    };

    this.parseBuffer = function(buffer){
        var dataStore = {};
        var offset = 0;
        var size = buffer.length;
        
        do{
            var item = {};
            item.name = buffer.subarray(offset, offset + 100);
            item.name = item.name.subarray(0, item.name.indexOf(0)).toString();
            if (item.name){
                if (item.name.substring(0,8) === "package/"){
                    item.name = item.name.substring(8); //remove prefix package/
                }
                item.size = parseInt(buffer.subarray(offset + 124, offset + 136).toString(), 8);
                item.payload = buffer.subarray(offset + 512, offset + 512 + item.size);
                dataStore[item.name] = item;
                
                //debug
                //remover
                //console.log(item);

            }

            if ((item.size % 512) === 0){
                offset = offset + (parseInt(item.size/512) + 1) * 512;
            }
            else{
                offset = offset + (parseInt(item.size/512) + 2) * 512;
            }
        } while (offset < size);
        
        return dataStore;
    };
};

module.exports = new ExtractTAR();