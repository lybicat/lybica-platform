/* jshint node: true */
'use strict';

var _ = require('lodash');
var Task = require('../../models').Task;
var io = require('../../app').io;
var taskEvent = require('../../events/taskevent');
var filterObjects = require('../../helper').filterObjects;


module.exports = {
  '/api/tasks': {
    get: function(req, res, next) {
      return filterObjects(Task, {done: false}, '-triggerat', req, res, next);
    },
    post: function(req, res, next) {
      var task = new Task();
      _.keys(req.body).forEach(function(attr) {
        task[attr] = req.body[attr];
      });
      task.save(function(err, t) {
        if (err) return next(err);
        io.emit('task', t);
        taskEvent.emit('create', t);
        return res.send(200, {id: t._id});
      });
    },
  },
  '/api/tasks/pending': {
    get: function(req, res, next) {
      return filterObjects(Task, {started: false}, '-triggerat', req, res, next);
    },
  },
  '/api/tasks/done': {
    get: function(req, res, next) {
      return filterObjects(Task, {done: true}, '-triggerat', req, res, next);
    },
  },
  '/api/task/:id': {
    get: function(req, res, next) {
      Task.findById(req.params.id, function(err, task) {
        if (task === null) {
          return res.send(404, {err: 'task ' + req.params.id + ' not found'});
        }
        return res.send(task);
      });
    },
    post: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          return res.send(404, {err: 'task ' + req.params.id + ' not found'});
        }
        _.keys(req.body).forEach(function(k) {
          task[k] = req.body[k];
        });
        task.save().then(function(t) {
          return res.send(200, t);
        });
      });
    }
  },
  '/api/task/:id/result': {
    post: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          return res.send(404, {err: 'task ' + req.params.id + ' not found'});
        }
        task.result = req.body;
        task.markModified('result');
        if (task.result.passed === true) {
          task.passed = true;
        }
        task.save().then(function(t) {
          return res.send(200, {});
        });
      });
    }
  },
  '/api/task/:id/start': {
    put: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          return res.send(404, {err: 'task ' + req.params.id + ' not found'});
        }
        task.started = true;
        task.startat = Date.now();
        task.save().then(function(t) {
          return res.send(200, {});
        });
      });
    }
  },
  '/api/task/:id/done': {
    put: function(req, res, next) {
      Task.findById(req.params.id)
      .then(function(task) {
        if (task === null) {
          return res.send(404, {err: 'task ' + req.params.id + ' not found'});
        }
        task.done = true;
        task.doneat = Date.now();
        task.save().then(function(t) {
          return res.send(200, {});
        });
      });
    }
  },
};

