/* jshint node: true */
/*
 * Doing cron tasks here, including trigger scanning and schedule scanning
*/
'use strict';

var Thenjs = require('thenjs');
var moment = require('moment');


function CronTask(interval) {
  this.interval = interval;
  this.running = false; // when running is true, skip the round
}

CronTask.prototype.run = function() {
  var self = this;

  function _run() {
    if(self.running === true) {
      console.warn('last round is still running, skip this round!');
      return;
    }

    self.running = true;
    var now = new moment();
    console.log('start round at ' + now.toISOString());

    function _scanTriggers(cont) {
      // TODO:
      console.log('start to scan triggers...');
      return cont(null);
    }

    function _scanSchedules(cont) {
      // TODO:
      console.log('start to scan schedules...');
      return cont(null);
    }

    Thenjs.parallel([
      _scanTriggers,
      _scanSchedules
    ])
    .fin(function(cont, err) {
      self.running = false;
      if(err) {
        // TODO:
      }
      console.log('done!');
    });
  }

  setInterval(_run, self.interval);
}


module.exports = CronTask;
