
var huji = require('./hujiwebserver');
var http = require('http');

function load() {

    var agent = new http.Agent();
    agent.maxSockets = 1000000;

    var test1 = {
        hostname: 'localhost',
        port: 1056,
        path: '/index.html',
        method: 'GET',
        agent: agent
    };

    var c = 0;

    for (var i = 0; i < 100; ++i) {
        http.get(test1, function () {
            c++;
            if (c === 100) {
                console.log("OK");
            }
        }).on('error', function () {

        });
    }
}
huji.start(1056, function (err, server) {

    if (!err) {
        server.use(huji.static("/www"));
        load();
    }

});