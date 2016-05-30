/**
 * Created by Roei on 12/23/2015.
 */

exports.create = myParser;

function httpReq() {
    this.headers = {
        "Content-Length": 0
    };
    this.body = "";
    this.method = "";
    this.url = "";
    this.ver = "";
    return this;
}

function myParser(parserCallback) {
    this.currentReq = new httpReq();
    this.isNew = true;
    this.isInHeader = false;
    this.isInBody = false;
    this.callback = parserCallback;
    return this;
}

myParser.prototype.parse = function(data) {
    var buffer = data;
    if(this.isNew) {
        var eolIndex = buffer.indexOf("\r\n");
        var firstLine = buffer.substr(0, eolIndex);
        buffer = buffer.substring(eolIndex + 2); // Deleting first line from buffer
        firstLine = firstLine.split(" ");
        if (validFirstLine(firstLine)) {
            this.currentReq.method = firstLine[0];
            this.currentReq.url = firstLine[1];
            this.currentReq.ver = firstLine[2].substr(firstLine[2].indexOf("/") + 1);
            this.isNew = false;
            this.isInHeader = true;
        } else {
            this.callback(new Error("bad first line request"), null);
        }
    }
    if (this.isInHeader) {
        var currLine;
        var prevLine;
        while(buffer) {
            var eolIndex = buffer.indexOf("\r\n");
            currLine = buffer.substring(0, eolIndex);
            buffer = buffer.substr(eolIndex + 2);
            if (currLine === "\r\n" ||
                currLine === "") {
                this.isInHeader = false;
                this.isInBody = true;
                break;
            } else if (currLine[0] === ' ' || currLine[0] === '\t') {
                currLine = currLine.substr(currLine.indexOf("[\w]"));
                this.currentReq.headers[prevLine] = this.currentReq.headers[prevLine] + currLine;
            } else {
                currLine = currLine.split(": ");
                if (currLine.length === 1) {
                    this.callback(new Error("bad header", null))
                }
                this.currentReq.headers[currLine[0].replace("[ \t]", "")] = currLine[1].replace("\r\n", "");
                prevLine = currLine[0];
            }
        }
    }
    if (this.isInBody) {
        // If 0 body length
        if (this.currentReq.headers["Content-Length"] === 0) {
            this.isInBody = false;
        } else {
            // Checking if buffer bigger then the content length (max body)
            // minus whats already inside to not over adding
            var currBodyLength = this.currentReq.body.length;
            var contentLength = parseInt(this.currentReq.headers["Content-Length"]);
            if (buffer.length > contentLength - currBodyLength) {
                this.currentReq.body += buffer.substring(0, contentLength - currBodyLength);
                buffer = buffer.substring(contentLength - currBodyLength);
                this.isInBody = false;
            } else {
                this.currentReq.body += buffer;
                buffer = "";
                // Checking if there is no more room to add body
                if (this.currentReq.body.length === contentLength) {
                    this.isInBody = false;
                }
            }
        }
    }
    // Checking if the req sending is finished, and if so start doing it!
    if (!this.isNew && !this.isInHeader && !this.isInBody) {
        this.isNew = true;
        this.callback(null, this.currentReq);
    }
};

function validFirstLine(firstLine) {
    return (firstLine.length === 3 &&
            ((firstLine[2].substr(firstLine[2].indexOf("/") + 1) === "1.1") ||
            (firstLine[2].substr(firstLine[2].indexOf("/") + 1) === "1.0")));
}

exports.ResponseToString = function(httpResponse) {
    var returnedString = "HTTP/" + httpResponse.ver + " " +
                         httpResponse.statusCode + " " +
                         httpResponse.msg;
    for (var currHeader in httpResponse.headers) {
        returnedString += "\r\n" + currHeader + ": " + httpResponse.headers[currHeader];
    }
    returnedString += "\r\n\r\n";
    if (httpResponse.body) {
        returnedString += httpResponse.body;
    }
    return returnedString;
};