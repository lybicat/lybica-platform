/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Resource = require('../../models').Resource;
var uuid = require('uuid');

describe('/api/resources', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Resource.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('GET /api/resources return [] when no resources defined', function(done) {
    client.get('/api/resources', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });

  it('POST /api/resource/:id/reserve return 200 when resource not reserved', function(done) {
    var resource = new Resource();
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/reserve', {reserveby: 'unittest'}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.token).not.to.eql(null);
        expect(obj.reserveby).to.eql('unittest');
        expect(obj.reserveat).not.to.eql(null);
        done();
      });
    });
  });

  it('POST /api/resource/:id/reserve return 404 when resource reserved', function(done) {
    var resource = new Resource();
    resource.reserveby = 'unittest';
    resource.reserveat = Date.now();
    resource.reservetoken = uuid.v4();
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/reserve', {reserveby: 'unittest'}, function(err, req, res, obj) {
        expect(err).not.to.eql(null);
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
  });

  it('POST /api/resource/:id/reserve return 200 when reserve resource with same reservetoken', function(done) {
    var token = uuid.v4();
    var resource = new Resource();
    resource.reserveby = 'unittest';
    resource.reserveat = Date.now();
    resource.reservetoken = token;
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/reserve', {reserveby: 'unittest2', reservetoken: token}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.reservetoken).to.eql(token);
        expect(obj.reserveby).to.eql('unittest2');
        done();
      });
    });
  });
});

