/* jshint node: true */
// fake api service for testing
'use strict';

module.exports = {
  '/api/devices': {
    get: function(req, res, next) {
      var devTypes = [
        'FSMF+IPHY',
        'FSIH+IPHY',
        'FSM4+IPHY',
        '2FSMF+2IPHY',
        '2FSIH+2IPHY',
        'FSIH+FSMF+2IPHY'];
      return res.send(devTypes);
    },
  },
};
