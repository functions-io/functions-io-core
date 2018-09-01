"use strict";

module.exports = function(message){
    return new Promise(function(resolve, reject){
        try {
            resolve(message.x + message.y);
        }
        catch (error) {
            reject(error);
        }
    });
};