/* jshint node: true */
'use strict';

var Task = require('../../models').Task;
var io = require('../../app').io;

function _getFilteredTasks(filterCond, req, res, next) {
  Task.paginate(filterCond, {
    page: req.params.page || 1,
    limit: req.params.limit || 30,
    sortBy: {
      triggerat: -1
    },
    lean: true
  }, function(err, tasks, pageCount, itemCount) {
    if (err) return next(err);

    res.send(tasks);
    return next();
  });
}


module.exports = {
  '/api/tasks': {
    get: function(req, res, next) {
      return _getFilteredTasks({done: false}, req, res, next);
    },
    post: function(req, res, next) {
      var task = new Task();
      if (req.body.triggerby) task.triggerby = req.body.triggerby;
      if (req.body.build) task.build = req.body.build;
      task.actions = req.body.actions;
      task.caseset = req.body.caseset;
      task.device = req.body.device;
      task.save(function(err, t) {
        if (err) return next(err);
        io.emit('task', t);
        res.send(200, {id: t._id});
        return next();
      });
    },
  },
  '/api/tasks/pending': {
    get: function(req, res, next) {
      return _getFilteredTasks({started: false}, req, res, next);
    },
  },
  '/api/tasks/done': {
    get: function(req, res, next) {
      return _getFilteredTasks({done: true}, req, res, next);
    },
  },
  '/api/task/:id': {
    get: function(req, res, next) {
      Task.findById(req.params.id, function(err, task) {
        if (task === null) {
          res.send(404, {err: 'task ' + req.params.id + ' not found'});
          return next();
        }
        res.send(task);
        return next();
      });
    },
  },
  '/api/task/:id/result': {
    post: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          res.send(404, {err: 'task ' + req.params.id + ' not found'});
          return next();
        }
        task.result = req.body;
        task.markModified('result');
        if (task.result.passed === true) {
          task.passed = true;
        }
        task.done = true;
        task.save().then(function(t) {
          res.send(200, {});
          return next();
        });
      });
    }
  },
  '/api/task/:id/start': {
    put: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          res.send(404, {err: 'task ' + req.params.id + ' not found'});
          return next();
        }
        task.started = true;
        task.startat = Date.now();
        task.save().then(function(t) {
          res.send(200, {});
          return next();
        });
      });
    }
  },
  '/api/task/:id/done': {
    put: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          res.send(404, {err: 'task ' + req.params.id + ' not found'});
          return next();
        }
        task.done = true;
        task.doneat = Date.now();
        task.save().then(function(t) {
          res.send(200, {});
          return next();
        });
      });
    }
  },
};

