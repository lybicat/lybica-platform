/* jshint node: true */
'use strict';

var restify = require('restify');
var mongoose = require('mongoose');
var config = require('./config');
var restifyRoutes = require('restify-routes');
var log4js = require('log4js');
log4js.configure(config.LOG4JS_SETTINGS);

var logger = require('./logger')('app');

var server = restify.createServer({
  name: 'lybica',
  version: '1.0.0'
});

var io = require('./ws')(server.server);
module.exports.io = io;

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  return next();
});

// logging error request and response to error log
server.on('after', function(req, res, err) {
  if (res.statusCode >= 400) {
    logger.error('%d %s\n=================================\nRequest: %s\n===============================\nResponse: %s', res.statusCode, req.path(), req, res);
  }
});

restifyRoutes.set(server, __dirname + '/routes');

mongoose.connect(config.DB_URL);

server.listen(config.PORT, function() {
  logger.info('%s listening at %s', server.name, server.url);
  var CronTask = require('./cron');
  var cron = new CronTask(60000);
  logger.info('Scanning cron tasks every 60seconds');
  cron.run();
});

