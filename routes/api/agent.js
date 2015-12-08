/* jshint node: true */
'use strict';

var Agent = require('../../models').Agent;

module.exports = {
  '/api/agents': {
    get: function(req, res, next) {
      Agent.find({})
        .sort('-updateat')
        .exec(function(err, agents) {
          if (err) return next(err);
          res.send(agents);
        });
    }
  }
};
