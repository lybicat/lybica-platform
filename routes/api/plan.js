/* jshint node: true */
'use strict';

var _ = require('lodash-node');
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
      return _getFilteredPlans({removed: false}, req, res, next);
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
    }
  }
};

