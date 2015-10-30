var restify = require('restify');
var config = require('./config');

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

server.get('/api/taskqueue/:id', function(req, res, next) {
    res.send({id: req.params.id});
    return next();
});


server.listen(config.PORT || 3000, function() {
    console.log('%s listening at %s', server.name, server.url);
});
