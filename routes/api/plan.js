/* jshint node: true */
'use strict';

var _ = require('lodash');
var Plan = require('../../models').Plan;

function _getFilteredPlans(filterCond, req, res, next) {
  Plan.paginate(filterCond, {
    page: req.params.page || 1,
    limit: req.params.limit || 30,
    sortBy: {
      updateat: -1
    },
    lean: true
  }, function(err, plans, pageCount, itemCount) {
    if (err) return next(err);

    return res.send(plans);
  });
}


module.exports = {
  '/api/plans': {
    get: function(req, res, next) {
      var filterCond = _.clone(req.params);
      delete filterCond.page;
      delete filterCond.limit;

      filterCond.removed = filterCond.removed === true;

      return _getFilteredPlans(filterCond, req, res, next);
    },
    post: function(req, res, next) {
      var plan = new Plan();
      _.keys(req.body).forEach(function(attr) {
        plan[attr] = req.body[attr];
      });
      plan.save(function(err, p) {
        if (err) return next(err);
        return res.send(200, {id: p._id});
      });
    },
  },
  '/api/plan/:id': {
    get: function(req, res, next) {
      Plan.findById(req.params.id)
      .then(function(plan) {
        if (plan === null) return res.send(404);

        return res.send(plan);
      });
    },
    post: function(req, res, next) {
      Plan.findById(req.params.id)
      .then(function(plan) {
        if (plan === null) return res.send(404);

        Object.keys(req.body).forEach(function(k) {
          plan[k] = req.body[k];
        });
        plan.save().then(function(t) {
          return res.send(200, t);
        });
      });
    },
    del: function(req, res, next) {
      Plan.findByIdAndUpdate(req.params.id, {$set: {removed: true}}, function(err, plan) {
        if (err) return next(err);

        return res.send(200);
      });
    }
  },
};

