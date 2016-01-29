/* jshint node: true */
'use strict';

var Case = require('../../models').Case;

module.exports = {
  '/api/cases': {
    get: function(req, res, next) {
      return res.send([]);
    },
  },
};

