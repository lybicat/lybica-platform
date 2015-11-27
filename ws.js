var socketio = require('socket.io');

function Agent(opts) {
  this.ip = opts.ip;
  this.name = opts.name;
  this.platform = opts.platform;
  this.labels = opts.labels;
  this.runners = opts.runners;
}

Agent.prototype.connect = function() {
  // TODO: mark agent as online, and create/update its fields
};


Agent.prototype.disconnect = function() {
  // TODO: mark agent as offline, and record its last connected time
};


module.exports = function(server) {
  var io = socketio.listen(server);

  io.on('connection', function(socket) {
    var agent;
    var clientIp = socket.request.connection.remoteAddress;

    socket.on('agent', function(data) {
      data.ip = clientIp;
      console.log('agent connected! %j', data);
      agent = new Agent(data);
      agent.connect();
      // TODO: emit pending tasks
    });

    socket.on('disconnect', function() {
      if (agent) {
        agent.disconnect();
      }
    });
  });

  return io;
};

