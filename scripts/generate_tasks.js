/* jshint node: true */
'use strict';

var restify = require('restify');
var client = restify.createJsonClient({
    url: 'http://127.0.0.1'
});

var build = process.argv[2];
var caseset = process.argv[3];
var device = process.argv[4];
var actions = process.argv[5].split(',');

client.post('/api/tasks', {build: build, caseset: caseset, device: device, actions: actions}, function(err, res, req, obj) {
    if (err === null) {
        console.log('new task created!');
    }
});
