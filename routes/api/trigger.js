/* jshint node: true */
'use strict';

var _ = require('lodash');
var Trigger = require('../../models').Trigger;
var filterObjects = require('../../helper').filterObjects;


module.exports = {
  '/api/triggers': {
    get: function(req, res, next) {
      var filterCond = _.clone(req.params);
      delete filterCond.page;
      delete filterCond.limit;

      filterCond.removed = filterCond.removed === 'true';

      return filterObjects(Trigger, filterCond, '-updateat', req, res, next);
    },
    post: function(req, res, next) {
      var trigger = new Trigger();
      _.keys(req.body).forEach(function(attr) {
        trigger[attr] = req.body[attr];
      });
      trigger.save(function(err, p) {
        if (err) return next(err);
        return res.send(200, {id: p._id});
      });
    },
  },
  '/api/trigger/:id': {
    get: function(req, res, next) {
      Trigger.findById(req.params.id)
      .then(function(trigger) {
        if (trigger === null) return res.send(404);

        return res.send(trigger);
      });
    },
    post: function(req, res, next) {
      Trigger.findById(req.params.id)
      .then(function(trigger) {
        if (trigger === null) return res.send(404);

        _.keys(req.body).forEach(function(k) {
          trigger[k] = req.body[k];
        });
        trigger.save().then(function(t) {
          return res.send(200, t);
        });
      });
    },
    del: function(req, res, next) {
      Trigger.findByIdAndUpdate(req.params.id, {$set: {removed: true}}, function(err, trigger) {
        if (err) return next(err);

        return res.send(200);
      });
    }
  },
  '/api/trigger/:id/enable': {
    put: function(req, res, next) {
      Trigger.findByIdAndUpdate(req.params.id, {$set: {disabled: false}}, function(err, trigger) {
        if (err) return next(err);

        return res.send(200);
      })
    }
  },
  '/api/trigger/:id/disable': {
    put: function(req, res, next) {
      Trigger.findByIdAndUpdate(req.params.id, {$set: {disabled: true}}, function(err, trigger) {
        if (err) return next(err);

        return res.send(200);
      })
    }
  },
};

