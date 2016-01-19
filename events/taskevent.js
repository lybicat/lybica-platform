/* jshint node: true */
'use strict';

var EventEmitter = require('events');
var Build = require('../models').Build;

var taskEvent = new EventEmitter();

// handle new task create event
taskEvent.on('create', function(task) {
  if (task.build !== '') {
    // append task to specified build
    Build.findOneAndUpdate(
      {name: task.build},
      {$push: {tasks: task._id}, $setOnInsert: {createat: Date.now()}},
      {upsert: true},
      function(err, build) {
        if (err) {
          console.error(err);
        }
      });
  }
});

module.exports = taskEvent;

