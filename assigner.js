var Task = require('./models').Task;


module.exports.getPendingTasks = function(callback) {
  console.log('searching pending tasks to assign');

  // TODO: device pending make task pending
  Task.find({started: false}, function(err, tasks) {
    if (err) return callback(err);
    console.log('find %d pending tasks', tasks.length);
    return callback(null, tasks);
  });
};
