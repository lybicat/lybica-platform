/* jshint node: true */
/*
 * Doing cron tasks here, including trigger scanning and schedule scanning
*/
'use strict';

var Thenjs = require('thenjs');
var logger = require('./logger')('cron');


function CronTask(interval) {
  this.interval = interval;
  this.running = false; // when running is true, skip the round
}

CronTask.prototype.run = function() {
  var self = this;

  function _run() {
    if(self.running === true) {
      logger.warn('last round is still running, skip this round!');
      return;
    }

    self.running = true;
    logger.info('start a new round');

    function _scanTriggers(cont) {
      // TODO:
      logger.info('start to scan triggers...');
      return cont(null);
    }

    function _scanSchedules(cont) {
      // TODO:
      logger.info('start to scan schedules...');
      return cont(null);
    }

    Thenjs.parallel([
      _scanTriggers,
      _scanSchedules
    ])
    .fin(function(cont, err) {
      self.running = false;
      if(err) {
        logger.error('cron job failed, error: %s', err);
      }
      logger.info('done!');
    });
  }

  setInterval(_run, self.interval);
}

module.exports = CronTask;
