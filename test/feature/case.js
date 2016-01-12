/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Case = require('../../models').Case;

describe('/api/cases', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Case.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('GET /api/cases return [] when no cases defined', function(done) {
    client.get('/api/cases', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });
});

