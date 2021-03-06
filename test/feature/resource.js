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

  it('POST /api/resources return resource', function(done) {
    client.post('/api/resources', {name: 'ut', ip: '127.0.0.1', createby: 'unittest', labels: ['a', 'b']}, function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj.id).not.to.eql(null);
      expect(obj.createby).to.eql('unittest');
      expect(obj.name).to.eql('ut');
      expect(obj.ip).to.eql('127.0.0.1');
      expect(obj.labels[0]).to.eql('a');
      expect(obj.labels[1]).to.eql('b');
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

  it('POST /api/resource/:id/reserve return 200 when reservation expired', function(done) {
    var token = uuid.v4();
    var resource = new Resource();
    resource.reserveby = 'unittest';
    resource.reserveat = Date.now() - 300000;
    resource.reserveexpired = Date.now();
    resource.reservetoken = token;
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/reserve', {reserveby: 'unittest2', reserveduration: 300000}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.reservetoken).not.to.eql(token);
        expect(obj.reserveby).to.eql('unittest2');
        done();
      });
    });
  });

  it('POST /api/resource/:id/unreserve return 200 when token matched', function(done) {
    var token = uuid.v4();
    var resource = new Resource();
    resource.reserveby = 'unittest';
    resource.reserveat = Date.now();
    resource.reserveexpired = Date.now();
    resource.reservetoken = token;
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/unreserve', {reservetoken: token}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.reservetoken).to.eql(null);
        expect(obj.reserveby).to.eql(null);
        expect(obj.reserveat).to.eql(null);
        expect(obj.reserveexpired).to.eql(null);
        done();
      });
    });
  });

  it('POST /api/resource/:id/unreserve return 200 when resource expired', function(done) {
    var token = uuid.v4();
    var resource = new Resource();
    resource.reserveby = 'unittest';
    resource.reserveat = Date.now() - 300000;
    resource.reserveexpired = Date.now();
    resource.reservetoken = token;
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/unreserve', {}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.reservetoken).to.eql(null);
        expect(obj.reserveby).to.eql(null);
        expect(obj.reserveat).to.eql(null);
        expect(obj.reserveexpired).to.eql(null);
        done();
      });
    });
  });

  it('POST /api/resource/:id/unreserve return 404 when token not match', function(done) {
    var resource = new Resource();
    resource.reserveby = 'unittest';
    resource.reserveat = Date.now();
    resource.reserveexpired = Date.now() + 300000;
    resource.reservetoken = uuid.v4();
    resource.save().then(function(r) {
      client.post('/api/resource/' + r._id + '/unreserve', {token: uuid.v4()}, function(err, req, res, obj) {
        expect(err).not.to.eql(null);
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
  });
});

