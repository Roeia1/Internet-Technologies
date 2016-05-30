/**
 * Created by Roei on 12/22/2015.
 */

var huji = require('./hujiwebserver');
var http = require('http');

function load() {
    var agent = new http.Agent();
    agent.maxSockets = 1000000;
    var test1 = {
        hostname: 'localhost',
        port: 1056,
        path: '/style.css',
        method: 'GET',
        agent: agent
    };
    for (var i = 0; i < 100; ++i) {
        http.request(test1, function () {}).on('error', function () {});
    }
}

huji.start(1056, '', function (e) {
    load();
});