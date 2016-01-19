/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Build = require('../../models').Build;

describe('/api/builds', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Build.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('GET /api/builds return [] when no builds exist', function(done) {
    client.get('/api/builds', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });

  it('GET /api/builds return [build] when builds exist', function(done) {
    var b = new Build();
    b.name = 'unittest';
    b.save().then(function(build) {
      client.get('/api/builds', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        expect(obj[0].name).to.eql('unittest');
        expect(obj[0].tasks).to.eql([]);
        done();
      });
    });
  });
});

