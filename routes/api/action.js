/* jshint node: true */
'use strict';

var Action = require('../../models').Action;

module.exports = {
    '/api/actions': {
        get: function(req, res, next) {
            Action.find().then(function(actions) {
                res.send(actions);
                return next();
            });
        },
    },
};
