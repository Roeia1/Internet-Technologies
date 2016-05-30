/**
 * Created by Roei on 12/21/2015.
 */

var net = require('net');
var fs = require('fs');
var path = require('path');
var parser = require('./hujiparser');

//var extensions = [".js", ".tx", ".html", ".css", ".jpg", ".gif"]

var contentTypes = {
    ".js": "application/javascript",
    ".txt": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".gif": "image/gif"
};

exports.createServer = function(rootFolder, startCallback) {
    // Resolving rootFolder
    this.root = rootFolder;

    var server;

    // Creating the server
    try {
        server = net.createServer(function(socket) {
            console.log('New connection established');
            var myParser = new parser.create(function (err, req) {
                if (err) {
                    socket.end();
                } else {
                    sendGetResponse(socket, req, rootFolder, function(err) {
                        if (err) {
                            console.log(err);
                            console.log("closing connection");
                            socket.end();
                        } else {
                            if (req.ver === 1.0 &&
                                req.headers["Connection"] &&
                                req.headers["Connection"] === "keep-alive") {
                                socket.end();
                            } else if (req.headers["Connection"] === "close") {
                                socket.end();
                            }
                        }
                    });
                }
            });
            socket.on('data', function(data) {
                myParser.parse(data.toString());
            });

            socket.setTimeout(2000, function() {
                socket.end();
            });
        });
        server.on('error', function (err) {
            startCallback(err);
            startCallback = null;

        });

        server.on('listening', function () {
            startCallback();
            startCallback = null;

        });
        return server;
    }
    catch(e) {
        startCallback(new Error("Couldn't start the server"));
        startCallback = null;
    }
};

function sendGetResponse(socket, req, rootFolder, responseCallback) {
    // Getting the file full path and extension
    var fileFullPath = path.join(path.normalize(rootFolder), path.normalize(req.url));
    var fileExtension = path.extname(fileFullPath);
    // Checking if bad method
    if (req.method !== "GET") {
        sendInternalErrorResponse(socket, req);
        responseCallback(new Error("bad method"));
        // Checking if it's a directory
    } else if (!(contentTypes[fileExtension])) {
        sendNotFoundResponse(socket,req);
        responseCallback(new Error("bad extension"));
    } else if (fs.lstatSync(fileFullPath).isDirectory()) {
        sendNotFoundResponse(socket,req);
        responseCallback(new Error("path is directory"));
    // Checking if bad file extension
    } else {
        fs.stat(fileFullPath, function(err, stats) {
            // Checking if file exists
            if (err) {
                sendNotFoundResponse(socket, req);
                responseCallback(new Error("file not found"));
                // Checking if it's a directory
            } else if (stats.isDirectory()) {
                sendNotFoundResponse(socket, req);
                responseCallback(new Error("path is directory"));
            } else {
                var fileStream = fs.createReadStream(fileFullPath);
                fileStream.on('open', function () {
                    // Creating the header for the response
                    var response = new httpResponse();
                    response.ver = req.ver;
                    response.statusCode = 200;
                    response.msg = "OK";
                    response.headers["Content-Type"] = contentTypes[fileExtension];
                    response.headers["Date"] = new Date().toUTCString();
                    response.headers["Content-Length"] = stats.size;
                    // Writing the header to the socket
                    console.log(parser.ResponseToString(response));
                    socket.write(new Buffer(parser.ResponseToString(response)));
                    // Writing the file to the socket
                    fileStream.pipe(socket, {end: false});
                });
                fileStream.on('error', function (err) {
                    sendNotFoundResponse(req, socket);
                    responseCallback(new Error("Resource error"));
                });
                fileStream.on('end', function () { // finished stream
                    responseCallback();
                });
            }
        });
    }
}

function sendNotFoundResponse(socket, req) {
    const NOT_FOUND = "<h1>404 NOT FOUND</h1>";
    var response = new httpResponse();
    response.ver = req.ver;
    response.statusCode = 404;
    response.msg = "Not Found";
    response.headers["Content-Type"] = "text/html";
    response.headers["Date"] = new Date().toUTCString();
    response.headers["Content-Length"] = NOT_FOUND.length;
    response.body = NOT_FOUND;
    socket.write(parser.ResponseToString(response), 'utf8');
}

function sendInternalErrorResponse(socket, req) {
    const INTERNAL_ERROR = "<h1>500 Internal Server Error</h1>"
    var response = new httpResponse();
    response.ver = req.ver;
    response.statusCode = 500;
    response.msg = "Internal Error";
    response.headers["Content-Type"] = "text/html";
    response.headers["Date"] = new Date().toUTCString();
    response.headers["Content-Length"] = INTERNAL_ERROR.length;
    response.body = INTERNAL_ERROR;
    socket.write(parser.ResponseToString(response), 'utf8');
}

function httpResponse() {
    this.headers = {};
    return this;
}