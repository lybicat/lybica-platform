var socketio = require('socket.io');

module.exports = function(server) {
  var io = socketio.listen(server);

  io.sockets.on('connection', function(socket) {
    socket.emit('hello', {hello: 'world'});
    socket.on('event', function(data) {
      console.log(data);
    });
  });

  return io;
};

