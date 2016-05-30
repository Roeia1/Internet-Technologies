/**
 * Created by Roei on 12/23/2015.
 */

var url = require('url');

exports.create = myParser;

function httpReq() {
    this.headers = {
        "content-length": 0
    };
    this.body = {};
    this.params = {};
    this.cookies = {};
    this.query = {};
    this.method = "";
    this.path = "";
    this.host = "";
    this.ver = "";
    this.protocol = "";
    return this;
}

httpReq.prototype.is = function (type) {
    console.log("enter is func");
    var thisContentType = this.headers['content-type'];
    console.log("type: " + type);
    console.log("header contentType: " + this.headers['content-type']);
    if (!thisContentType) {
        return true;
    }
    if (typeof type !== 'string') {
        if (thisContentType === 'application/json') {
            console.log("type application/json");
            return true;
        } else {
            console.log("type object not application/json");
            return false;
        }
    }
    if (thisContentType.indexOf(';') !== -1) {
        thisContentType = thisContentType.substr(0, thisContentType.indexOf(';'));
    }
    if (thisContentType === type) {
        console.log("contentType exactly matched");
        return true;
    }
    var splitContentType = thisContentType.split('/');
    if (splitContentType[1] === type) {
        console.log("right contentType exactly matched");
        return true;
    }
    if (type.indexOf(splitContentType[0]+'/') === 0) {
        console.log("left with something contentType exactly matched");
        return true;
    }
    console.log("nothing matched in is func");
    return false;
};

httpReq.prototype.get = function (field) {
    return this.headers[field.toLowerCase()];
};

httpReq.prototype.param = function (name) {
    var param = this.params[name];
    if (param === undefined) {
        param = this.body[name];
    }
    if (param === undefined) {
        param = this.query[name];
    }
    return param;
}

httpReq.prototype.setBody = function (body) {
    console.log("enter setBody");
    console.log("body is: " + body);
    if (!body) {
        console.log("no body");
        return true;
    }
    console.log("contentType is: " + this.headers['content-type']);
    if (this.headers['content-type'] === "application/json") {
        console.log("contentType application/json");
        try {
            this.body = JSON.parse(body);
        } catch (err) {
            console.log("couldn't json parse the body");
            this.body = body;
        }
    } else if (this.headers['content-type'] === "application/x-www-form-urlencoded") {
        console.log("contentType application/x-www-form-urlencoded");
        var splitBody;
        if (body.indexOf('&') !== -1) {
            splitBody = body.split('&');
        }
        for (var param in splitBody) {
            var splitParam = splitBody[param].split('=');
            if (splitParam.length !== 2) {
                return false;
            }
            this.body[splitParam[0]] = splitParam[1];
        }
    } else {
        console.log("set the body as is");
        this.body = body;
    }
    console.log("finish setBody. body is: " + this.body);
    return true;
}

function myParser(parserCallback) {
    this.currentReq = new httpReq();
    this.isNew = true;
    this.isInHeader = false;
    this.isInBody = false;
    this.callback = parserCallback;
    this.body = "";
    return this;
}

myParser.prototype.parse = function(data) {
    console.log("enter parse func");
    var buffer = data;
    console.log("data is: " + data);
    if(this.isNew) {
        var eolIndex = buffer.indexOf("\r\n");
        var firstLine = buffer.substr(0, eolIndex);
        buffer = buffer.substring(eolIndex + 2); // Deleting first line from buffer
        firstLine = firstLine.split(" ");
        if (validFirstLine(firstLine)) {
            console.log("valid first line");
            this.currentReq.method = firstLine[0];
            var myUrl = url.parse(firstLine[1], true);
            console.log("succeed url parse");
            if (myUrl.search) {
                console.log("query exist: " + myUrl.query);
                this.currentReq.query = myUrl.query;
                this.currentReq.path = firstLine[1].substr(0,firstLine[1].indexOf('?'));
            } else if(myUrl.hash) {
                this.currentReq.path = firstLine[1].substr(0,firstLine[1].indexOf('#'));
            } else {
                this.currentReq.path = firstLine[1];
            }
            this.currentReq.protocol = firstLine[2].substr(0, firstLine[2].indexOf("/")).toLowerCase();
            this.currentReq.ver = firstLine[2].substr(firstLine[2].indexOf("/") + 1);
            console.log("ver is: " + this.currentReq.ver);
            console.log("protocol is: " + this.currentReq.protocol);
            this.isNew = false;
            this.isInHeader = true;
        } else {
            console.log("not a valid first line");
            this.callback(new Error("bad first line request"), null);
        }
    }
    if (this.isInHeader) {
        console.log("enter header section in parse");
        var currLine;
        var prevLine;
        while(buffer) {
            var eolIndex = buffer.indexOf("\r\n");
            currLine = buffer.substring(0, eolIndex);
            buffer = buffer.substr(eolIndex + 2);
            if (currLine === "\r\n" ||
                currLine === "") {
                this.isInHeader = false;
                console.log("done header section");
                this.isInBody = true;
                break;
            } else if (currLine[0] === ' ' || currLine[0] === '\t') {
                currLine = currLine.substr(currLine.indexOf("[\w]"));
                this.currentReq.headers[prevLine] = this.currentReq.headers[prevLine] + currLine;
            } else {
                console.log("current header is: " + currLine);
                currLine = currLine.split(": ");
                if (currLine.length === 1) {
                    console.log("bad current header");
                    this.callback(new Error("bad header", null))
                }
                var headerName = currLine[0].replace("[ \t]", "").toLowerCase();
                var headerValue = currLine[1].replace("\r\n", "");
                if (headerName === "cookie") {
                    console.log("header is cookie");
                    var cookies = headerValue.split(';');
                    for (var cookie in cookies) {
                        var splitCookie = cookies[cookie].split('=');
                        console.log("inserting cookie as name: " + splitCookie[0].trim() + "value: " + splitCookie[1].trim());
                        this.currentReq.cookies[splitCookie[0].trim()] = splitCookie[1].trim();
                    }
                } else {
                    console.log("inserting header as name: " + headerName + "value: " + headerValue);
                    if (headerName === 'host') {
                        this.currentReq.host = headerValue;
                    } else {
                        this.currentReq.headers[headerName] = headerValue;
                    }
                }
                prevLine = currLine[0];
            }
        }
    }
    if (this.isInBody) {
        console.log("in body section parse");
        // If 0 body length
        if (this.currentReq.headers["content-length"] === 0) {
            console.log("content length is 0");
            this.isInBody = false;
        } else {
            // Checking if buffer bigger then the content length (max body)
            // minus whats already inside to not over adding
            var currBodyLength = this.body.length;
            var contentLength = parseInt(this.currentReq.headers["content-length"]);
            if (buffer.length > contentLength - currBodyLength) {
                this.body += buffer.substring(0, contentLength - currBodyLength);
                buffer = buffer.substring(contentLength - currBodyLength);
                this.isInBody = false;
            } else {
                this.body += buffer;
                buffer = "";
                // Checking if there is no more room to add body
                if (this.body.length === contentLength) {
                    this.isInBody = false;
                }
            }
        }
    }
    // Checking if the req sending is finished, and if so start doing it!
    if (!this.isNew && !this.isInHeader && !this.isInBody) {
        console.log("finished parser body is: " + this.body);
        if (!this.currentReq.setBody(this.body)) {
            console.log("setBody failed");
            this.callback(new Error("Bad body parsing"), null);
        }
        console.log("finished req body is: " + this.currentReq.body);
        this.isNew = true;
        this.callback(null, this.currentReq);
    }
};

function validFirstLine(firstLine) {
    var methods = {
        GET: 0,
        HEAD: 1,
        POST: 2,
        PUT: 3,
        DELETE: 4,
        TRACE: 5,
        OPTIONS: 6,
        CONNECT: 7
    };
    return (firstLine.length === 3 &&
            methods[firstLine[0]] !== undefined &&
            ((firstLine[2].substr(firstLine[2].indexOf("/") + 1) === "1.1") ||
            (firstLine[2].substr(firstLine[2].indexOf("/") + 1) === "1.0")));
}

exports.ResponseToString = function(httpResponse) {
    var returnedString = "HTTP/" + httpResponse.ver + " " +
                         httpResponse.statusCode + " " +
                         this.status_messages[httpResponse.statusCode];
    for (var currHeader in httpResponse.headers) {
        returnedString += "\r\n" + currHeader + ": " + httpResponse.headers[currHeader];
    }
    for (var cookieName in httpResponse.cookies) {
        var cookie = httpResponse.cookies[cookieName];
        returnedString += "\r\nSet-Cookie: " + cookieName + "=" + cookie.value;
        for (var cookieOptions in cookie) {
            if (cookie[cookieOptions] !== cookie.value) {
                returnedString += "; " + cookieOptions + "=" + cookie[cookieOptions];
            }
        }
    }
    returnedString += "\r\n\r\n";
    if (httpResponse.body) {
        returnedString += httpResponse.body;
    }
    return returnedString;
};

exports.status_messages = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Moved Temporarily',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Time-out',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Large',
    415: 'Unsupported Media Type',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Time-out',
    505: 'HTTP Version not supported'
};