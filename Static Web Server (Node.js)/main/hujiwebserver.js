/**
 * Created by Roei on 12/19/2015.
 */

var myHuji = require('./hujinet');
var fs = require('fs');
var path = require('path');

var servers = {};
var server;

exports.start = function(port, rootFolder, startCallback) {
    return new serverObj(port, rootFolder, startCallback);
};

function serverObj(port, rootFolder, startCallback) {
    // Checking if root folder is valid
    if (!fs.lstatSync(path.normalize(rootFolder)).isDirectory()) {
        startCallback(new Error("rootFolder shuold be directory"));
    } else {
        /*
         Creating the server
         If succeed adding to dictionary and launching callback()
         If not launching callback(err)
         */
        server = myHuji.createServer(rootFolder, function (err) {
            if (err) {
                startCallback(err);
            } else {
                servers[port] = server;
                startCallback();
            }
        });

        Object.defineProperty(this, 'port', {
            value: port,
            writable: false
        });

        Object.defineProperty(this, 'rootFolder', {
            value: rootFolder,
            writable: false
        });
        server.listen(port);
        return this;
    }
}

serverObj.prototype.stop = function(stopCallback) {
    if (servers[this.port]) {
        servers[this.port].close(stopCallback);
    }
};