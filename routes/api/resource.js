/* jshint node: true */
'use strict';

var Resource = require('../../models').Resource;
var uuid = require('uuid');

function _getFilteredResources(filterCond, req, res, next) {
  Resource.paginate(filterCond, {
    page: req.params.page || 1,
    limit: req.params.limit || 30,
    sortBy: {
      updateat: -1
    },
    lean: true
  }, function(err, resources) {
    if (err) return next(err);

    return res.send(resources);
  });
}


module.exports = {
  '/api/resources': {
    get: function(req, res, next) {
      return _getFilteredResources({removed: false}, req, res, next);
    },
  },
  '/api/resource/:id/reserve': {
    post: function(req, res, next) {
      var querySet = {
        _id: req.params.id,
        removed: false,
        reservetoken: req.params.reservetoken || null,
      };
      var reserveSet = {
        reserveby: req.params.reserveby || 'SYSTEM',
        reserveat: Date.now(),
        reservetoken: req.params.reservetoken || uuid.v4(),
      };

      Resource.findOneAndUpdate(querySet, {
        $set: reserveSet
      })
      .then(function(resource) {
        if (resource === null) return res.send(404);

        return res.send(reserveSet);
      });
    },
  },
};
