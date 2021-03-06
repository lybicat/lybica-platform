/* jshint node: true */
'use strict';

var Resource = require('../../models').Resource;
var uuid = require('uuid');
var _ = require('lodash');

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
      var filterCond = _.clone(req.params);
      delete filterCond.page;
      delete filterCond.limit;

      filterCond.removed = filterCond.removed === true;
      return _getFilteredResources(filterCond, req, res, next);
    },
    post:function(req, res, next) {
      var resource = new Resource();
      _.keys(req.body).forEach(function(attr) {
        resource[attr] = req.body[attr];
      });
      resource.save(function(err, r) {
        if (err) return next(err);
        return res.send(r);
      });
    }
  },
  '/api/resource/:id/reserve': {
    post: function(req, res, next) {
      var _now = Date.now();
      var querySet = {
        _id: req.params.id,
        $or: [{reservetoken: req.params.reservetoken || null},
          {reserveexpired: {$lt: _now}}
        ],
      };
      var reserveSet = {
        reserveby: req.params.reserveby || 'SYSTEM',
        reserveat: _now,
        reserveexpired: _now + parseInt(req.params.reserveduration || 300000),
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
  '/api/resource/:id/unreserve': {
    post: function(req, res, next) {
      var querySet = {
        _id: req.params.id,
        $or: [{reservetoken: req.params.reservetoken || null},
          {reserveexpired: {$lt: Date.now()}}
        ],
      };

      Resource.findOneAndUpdate(querySet, {
        $set: {
          reserveby: null,
          reserveat: null,
          reserveexpired: null,
          reservetoken: null
        }
      }, {new: true})
      .then(function(resource) {
        if (resource === null) return res.send(404);

        return res.send(resource);
      });
    },
  },
};
