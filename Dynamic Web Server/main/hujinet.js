/**
 * Created by Roei on 12/21/2015.
 */

var net = require('net');
var fs = require('fs');
var path = require('path');
var parser = require('./hujiparser');

exports.createServer = function(handlers, serverCallback) {
    var server;
    // Creating the server
    try {
        console.log("enter createServer func");
        server = net.createServer(function(socket) {
            console.log("enter createServer net callback");
            console.log('New connection established');
            var myParser = new parser.create(function (err, req) {
                if (err) {
                    console.log("closing connection 4");
                    socket.end();
                } else {
                    sendGetResponse(handlers, socket, req, function () {
                        console.log("enter sendGetResponse callback");
                        if (req.ver === 1.0 &&
                            req.headers["connection"] &&
                            req.headers["connection"] === "keep-alive") {
                            console.log("closing connection 3");
                            socket.end();
                        } else if (req.headers["connection"] === "close") {
                            console.log("closing connection 2");
                            socket.end();
                        }
                    });
                }
            });
            socket.on('data', function (data) {
                myParser.parse(data.toString());
            });

            socket.setTimeout(2000, function () {
                console.log("closing connection 1");
                socket.end();
            });
        });
        server.on('error', function (err) {
            serverCallback(err);
            serverCallback = null;

        });

        server.on('listening', function () {
            serverCallback();
            serverCallback = null;

        });
        console.log("before returning the net server");
        return server;
    }
    catch(e) {
        serverCallback(new Error("Couldn't start the server"));
        serverCallback = null;
    }
};

function sendGetResponse(handlers, socket, req, responseCallback) {
    var response = new httpResponse(req, socket, responseCallback);
    var i = 0;
    function next() {
        console.log("path is: " + req.path);

        while (i < handlers.length) {
            var params = handlers[i].canHandle(req);
            if (params) {
                console.log("handler found");
                req.params = params;
                var handler = handlers[i].requestHandler;
                try {
                    ++i;
                    console.log("before handler running the handler");
                    handler(req, response, next);
                    return;
                } catch (e) {
                    console.log(e);
                    response.status(500).send("INTERNAL SERVER ERROR");
                    return;
                }
            }
            ++i;
        }
        console.log("handler didn't found");
        response.body = "The requested resource not found";
        response.status(404).send(response.body);
    }
    next();
}

function httpResponse(req, socket, responseCallback) {
    this.headers = {};
    this.cookies = {};
    this.statusCode = 200;
    this.socket = socket;
    this.sent = false;
    this.ver = req ? req.ver : "1.1";
    this.protocol = req.protocol;
    this.callback = responseCallback;
    return this;
}

httpResponse.prototype.set = function (field, value) {
    if (arguments.length === 2) {
        this.headers[field] = value;
    } else {
        for (var fieldType in field) {
            this.headers[fieldType] = field[fieldType];
        }
    }
    return this;
};

httpResponse.prototype.status = function (code) {
    this.statusCode = code;
    return this;
};

httpResponse.prototype.cookie = function (name, value, options) {
    var possibleCookies = ["domain", "path", "secure", "expires", "maxAge", "httpOnly", "signed"];
    var defaultCookieOptions = {
        path: "/"
    };
    var cookie = {
        value: value
    };
    options = options || {};
    for (var i = 0; i < possibleCookies.length; i++) {
        if (options[possibleCookies[i]]) {
            cookie[possibleCookies[i]] = options[possibleCookies[i]];
        } else if (defaultCookieOptions[possibleCookies[i]]) {
            cookie[possibleCookies[i]] = defaultCookieOptions[possibleCookies[i]];
        }
    }
    this.cookies[name] = cookie;
    return this;
};

httpResponse.prototype.get = function (field) {
    return this.headers[field];
};

httpResponse.prototype.send = function (body) {
    console.log("enter send. body: " + body);
    var that = this;
    if (!this.sent) {
        var contentType = this.headers['Content-Type'];
        body = body || "";
        console.log("the content-type is: " + contentType);
        if (typeof body === 'string') {
            if (contentType === undefined) {
                contentType = "text/html";
            }
            this.body = body;
        } else if (body instanceof Object) {
            if (body instanceof Buffer) {
                if (contentType === undefined) {
                    contentType = "text/html";
                }
                this.body = body.toString();
            } else {
                console.log("before running json func");
                this.json(body);
                console.log("after running json func");
                return;
            }
        }
        console.log("it's string or a buffer");
        this.headers['Content-Type'] = contentType;
        this.headers['Content-Length'] = body.length;
        var stringResponse = parser.ResponseToString(this);
        console.log("before writing to socket this: " + stringResponse);
        this.socket.write(stringResponse, function () {
            console.log("after writing to socket");
            that.callback();
        });
        this.sent = true;
    }
};

httpResponse.prototype.json = function (body) {
    var that = this;
    this.body = JSON.stringify(body);
    var contentLength = this.body ? this.body.length : 0;
    this.headers['Content-Type'] = "application/json";
    this.headers["Content-Length"] = contentLength;
    var stringResponse = parser.ResponseToString(this);
    console.log("before writing to socket this: " + stringResponse);
    this.socket.write(stringResponse, function () {
        console.log("after writing to socket");
        that.callback();
    });
    this.sent = true;
};

httpResponse.prototype.sendFile = function (file, callback) {
    console.log("in sendfile");
    var that = this;
    console.log("file: " + file);
    fs.stat(file, function (e, stat) {
        if (e) {
            console.log("i am error");
            callback(e);
            return;
        }
        if (stat.isDirectory()) {
            console.log("i am directory");
            callback(new Error(file + " is directory"));
            return;
        }
        console.log("size is: " + stat.size.toString());
        console.log("size is: " + exports.getContentType(file));
        that.set({
            "Content-Length": stat.size.toString(),
            "Content-Type": exports.getContentType(file)
        });
        var fileStream = fs.createReadStream(file);
        console.log("stream ok");
        fileStream.on('open', function () {
            console.log("stream ok");
            that.socket.write(new Buffer(parser.ResponseToString(that)));
            fileStream.pipe(that.socket, {end: false});
        });
        fileStream.on('error', function () {
            callback(new Error("Resource error"));
        });
        fileStream.on('end', function () { // finished stream
            that.callback();
        });
    });
};

function requestHandlerObj(resource, requestHandler) {
    this.requestHandler = requestHandler;
    if (resource[resource.length - 1] !== '/') {
        resource = resource + '/';
    }
    if (resource[0] !== '/') {
        resource = '/' + resource;
    }
    this.resource = parseResource(resource);
    return this;
    function parseResource(resource) {
        var captureGroup = 1;
        const arr = resource.split('/');
        var counter = 0;
        var param = {};
        var newResource = [];
        newResource.push('^');
        for (var i = 1; i < arr.length; ++i) {
            if (newResource[newResource.length - 1] !== '/') {
                newResource.push('\\/');
            }
            if (arr[i][0] === ':') {
                newResource.push('([^\\/]+?)');
                var temp = arr[i].substr(1);
                param[captureGroup] = temp;
                captureGroup++;
                continue;
            }
            if (arr[i][0] === '*') {
                param[counter++] = captureGroup;
                newResource.push('(.*)');
                continue;
            }
            newResource.push(arr[i]);
        }
        newResource.push('(?:(?:\\/.*)?|$)');
        return {
            regex: new RegExp(newResource.join(""), "i"),
            param: param,
            resource: resource
        };
    }
}

requestHandlerObj.prototype.canHandle = function (req) {
    var path = req.path;
    var retVal = {};
    // insert trailing slash
    if (path[path.length - 1] !== '/') {
        path = path + '/';
    }
    console.log("enter canHandle");
    var match = path.match(this.resource.regex);
    if (match) {
        console.log("matched resource is: " +this.resource.resource);
        console.log("matched regex is: " +this.resource.regex);
        console.log("param is: " + JSON.stringify(this.resource.param));
        var param = this.resource.param || {};
        for (var key in param) {
            retVal[param[key]] = match[key];
        }
        return retVal;
    } else {
        return null;
    }
};

exports.addHandler = function (handlers, resource, requestHandler) {
    console.log("before creating the handler");
    //console.log(handlers);
    handlers.push(new requestHandlerObj(resource, requestHandler));
}

exports.getContentType = function getContentType(filePath) {
    var ext = path.extname(filePath);
    console.log("ext: " + ext.substr(1, ext.length));
    console.log("ext: " + exports.content_types[ext.substr(0, ext.length)]);
    return exports.content_types[ext.substr(0, ext.length)];
};

exports.content_types = {
    ".js": "application/javascript",
    ".txt": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".gif": "image/gif"
};