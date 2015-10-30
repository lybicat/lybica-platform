var restify = require('restify');
var mongoose = require('mongoose');
var config = require('./config');
var models = require('./models');

var server = restify.createServer({
    name: 'lybica',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    return next();
});

server.get('/api/task/:id', function(req, res, next) {
    res.send({id: req.params.id});
    return next();
});

mongoose.connect(config.DB_URL);

server.listen(config.PORT || 3000, function() {
    console.log('%s listening at %s', server.name, server.url);
});
