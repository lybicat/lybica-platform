/* jshint node: true */
'use strict';

var Action = require('../../models').Action;

module.exports = {
    '/api/actions': {
        get: function(req, res, next) {
          Action.find({})
            .sort('-updateat')
            .exec(function(err, actions) {
              if (err) return next(err);
              return res.send(actions);
            });
        },
    },
};
