/**
 * Created by Roei on 12/19/2015.
 */

var myHuji = require('./hujinet');
var fs = require('fs');
var path = require('path');

var servers = {};
var server;

exports.start = function(port, startCallback) {
    return new serverObj(port, startCallback);
};

function serverObj(port, startCallback) {
    console.log("enter obj constructor");
    var that = this;
    this.handlers = [];
    /*
     Creating the server
     If succeed adding to dictionary and launching callback()
     If not launching callback(err)
     */
    server = myHuji.createServer(this.handlers, function (err) {
        if (err) {
            console.log("enter createServer callback error");
            startCallback(err, null);
        } else {
            console.log("enter createServer callback");
            servers[port] = server;
            startCallback(null, that);
        }
    });
    Object.defineProperty(this, 'port', {
        value: port,
        writable: false
    });
    console.log("before serverObj listen in constructor");
    server.listen(port);
    return this;
}

serverObj.prototype.stop = function(stopCallback) {
    console.log("stoping!");
    console.log("port: " + this.port);
    if (servers[this.port]) {
        console.log("hereeeeee");
        servers[this.port].close(stopCallback);
    }
};

serverObj.prototype.use = function(resource, requestHandler) {
    console.log("enter use function");
    if (typeof resource === 'function') {
        console.log("no resource");
        requestHandler = resource;
        resource = '/';
    } else if (typeof resource !== 'string') {
        console.log("resource not string");
        return;
    } else if (typeof requestHandler !== 'function') {
        console.log("handler aint a function");
        return;
    }
    myHuji.addHandler(this.handlers, resource, requestHandler);
};

exports.static = function (route) {


    var route = path.normalize('/' + route);
    console.log("route is: " + route);
    return function (req, resp) {
        console.log("in static handler");
        console.log("route is: " + route);
        console.log("path is: " + req.path);
        var requestedResource = path.join(route, path.normalize(req.path));
        console.log("requestedResource: " + requestedResource)
        requestedResource = path.join(path.resolve(route, __dirname), requestedResource);
        console.log("requestedResource: " + requestedResource)
        var contentType = myHuji.getContentType(requestedResource);
        if (req.is(contentType)) {
            resp.sendFile(requestedResource, function (err) {
                if (err) {
                    console.log(err);
                    resp.status(404).send("NOT FOUND");
                }
            });
        } else {
            resp.status(415).send("UNSUPPORTED MEDIA TYPE");
        }
    };
};

exports.myUse = function (userName, password) {
    const FLAG_COOKIE = "imAflag";
    return function (req, resp, next) {
        if (req.cookies[FLAG_COOKIE]) {
            next();
        } else {
            if (req.param("user") === userName && req.param("password") === password) {
                resp.cookie(FLAG_COOKIE, "1", {path: "/"});
                next();
            } else {
                resp.status(401).send("Unauthorized access");
            }
        }
    };
};

exports.myUse.toString = "This function gets 2 parameters: a username and a password, and returns a requestHandler " +
    "function with the 3 usual parameters (request, response and next). The returned function checks if the request has the flag " +
    "cookie, if it does then uses the next func. If not it checks if the request has username and password as the same as the func parameters, " +
    "and then create the flag cookie then calls the next func. Else sending an error- 401 status";