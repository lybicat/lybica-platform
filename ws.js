/* jshint node: true */
'use strict';

var socketio = require('socket.io');
var Agent = require('./models').Agent;
var Task = require('./models').Task;
var logger = require('./logger')('socket');

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
    if (err) logger.error('failed to create agent "%s"', self.ip);
    callback(err);
  });
};


AgentInst.prototype.disconnect = function() {
  var self = this;

  self.available = false;
  self.runners.running = 0;
  Agent.createOrUpdate(self.ip, self, function(err) {
    if (err) logger.error('failed to disconnect agent "%s"', self.ip);
  });

  Task.where({agent: self.ip, started: true, done: false})
    .update({done: true, doneat: Date.now(), aborted: true, abortat: Date.now(), abortby: 'agent'}, function(err, tasks) {
      if(err) logger.error('failed to abort tasks, error: %s', err);
    })
};


module.exports = function(server) {
  // TODO: before socket io create, set all agents to offline
  var io = socketio.listen(server);

  io.on('connection', function(socket) {
    var agent;
    var clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    logger.info('%s connected!', clientIp);

    function _emitPendingTasks() {
      Task.find({started: false})
      .then(function(tasks) {
        if (tasks.length > 0) {
          tasks.forEach(function(t) {
            socket.emit('task', t);
          });
        }
      });
    }

    function _updateRunning(inc) {
      if (agent) {
        Agent.findOneAndUpdate({ip: agent.ip}, {$inc: {'runners.running': inc}}, function(err) {
          if(err) logger.error(err);
        });
      }
    }

    function _assignAgentToTask(task) {
      Task.findByIdAndUpdate(task._id, {$set: {agent: clientIp}}, function(err, t) {
        if(err) logger.error(err);
      })
    }

    // agent register
    socket.on('agent', function(data) {
      data.ip = clientIp;
      agent = new AgentInst(data);
      agent.connect(function(err) {
        if (err === null) _emitPendingTasks();
      });
      logger.info('agent %s registered! %j', clientIp, data);
    });

    // task start
    socket.on('start', function(task) {
      _assignAgentToTask(task);
      _updateRunning(1); // runners.running ++
    });

    // task done
    socket.on('done', function(task) {
      _updateRunning(-1); // runners.running --
      _emitPendingTasks();
    });

    // error
    socket.on('error', function(err) {
      logger.error(err);
    });

    // forward console event to others
    socket.on('console', function(msg) {
      logger.info('receive console event');
      socket.broadcast.emit('console', msg);
    });

    socket.on('data', function(msg) {
      logger.info('send data to ' + msg.to);
      socket.to(msg.to).emit('data', msg.data);
    });

    // agent close
    socket.on('disconnect', function() {
      if (agent) {
        logger.info('agent "%s" disconnected!', agent.ip);
        agent.disconnect();
      }
    });
  });

  return io;
};

