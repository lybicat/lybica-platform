/* jshint node: true */
'use strict';

var socketio = require('socket.io');
var Agent = require('./models').Agent;
var Task = require('./models').Task;

function AgentInst(opts) {
  this.ip = opts.ip;
  this.name = opts.name;
  this.platform = opts.platform;
  this.labels = opts.labels;
  this.runners = {
    all: opts.runners.all,
    running: opts.runners.running
  };
}

AgentInst.prototype.connect = function() {
  var self = this;

  Agent.createOrUpdate(self.ip, self, function(err) {
    if (err) console.log('failed to create agent');
  });
};


AgentInst.prototype.disconnect = function() {
  var self = this;

  self.available = false;
  Agent.createOrUpdate(self.ip, self, function(err) {
    if (err) console.log('failed to disconnect agent');
  });
};


module.exports = function(server) {
  var io = socketio.listen(server);

  io.on('connection', function(socket) {
    var agent;
    var clientIp = socket.request.connection.remoteAddress;

    // agent register
    socket.on('agent', function(data) {
      data.ip = clientIp;
      console.log('agent connected! %j', data);
      agent = new AgentInst(data);
      agent.connect();
      // TODO: emit pending tasks
    });

    // task done
    socket.on('done', function() {
      // TODO: emit pending tasks
    });

    // error
    socket.on('error', function(err) {
      // TODO: handle error event
    });

    // agent close
    socket.on('disconnect', function() {
      if (agent) {
        agent.disconnect();
      }
    });
  });

  return io;
};

