/* jshint node: true */
'use strict';

var _ = require('lodash');
var Build = require('../../models').Build;
var filterObjects = require('../../helper').filterObjects;

module.exports = {
  '/api/builds': {
    get: function(req, res, next) {
      return filterObjects(Build, {}, '-createat', req, res, next);
    },
  },
}
