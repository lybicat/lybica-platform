/* jshint node: true */
'use strict';

var socketio = require('socket.io');
var Agent = require('./models').Agent;
var assigner = require('./assigner.js');

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

AgentInst.prototype.connect = function(callback) {
  var self = this;

  self.available = true;
  Agent.createOrUpdate(self.ip, self, function(err) {
    if (err) console.log('failed to create agent');
    callback(err);
  });
};


AgentInst.prototype.disconnect = function() {
  var self = this;

  self.available = false;
  self.runners.running = 0;
  Agent.createOrUpdate(self.ip, self, function(err) {
    if (err) console.log('failed to disconnect agent');
  });
};


module.exports = function(server) {
  // TODO: before socket io create, set all agents to offline
  var io = socketio.listen(server);

  io.on('connection', function(socket) {
    var agent;
    var clientIp = socket.request.connection.remoteAddress;

    function _emitPendingTasks() {
      assigner.getPendingTasks(function(err, tasks) {
        if (err === null && tasks.length > 0) {
          tasks.forEach(function(t) {
            socket.emit('task', t);
          });
        }
      });
    }

    function _updateRunning(inc) {
      if (agent) {
        Agent.findOneAndUpdate({ip: agent.ip}, {$inc: {'runners.running': inc}}, function(err) {
          if (err) console.log(err);
        });
      }
    }

    // agent register
    socket.on('agent', function(data) {
      data.ip = clientIp;
      console.log('agent connected! %j', data);
      agent = new AgentInst(data);
      agent.connect(function(err) {
        if (err === null) _emitPendingTasks();
      });
    });

    // task start
    socket.on('start', function() {
      _updateRunning(1); // runners.running ++
    });

    // task done
    socket.on('done', function() {
      _updateRunning(-1); // runners.running --
      _emitPendingTasks();
    });

    // error
    socket.on('error', function(err) {
      // TODO: handle error event
    });

    // agent close
    socket.on('disconnect', function() {
      if (agent) {
        console.log('agent "%s" disconnected!', agent.ip);
        agent.disconnect();
      }
    });
  });

  return io;
};

