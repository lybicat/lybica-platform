/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Plan = require('../../models').Plan;

describe('/api/plans', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Plan.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('GET /api/plans return [] when no plans defined', function(done) {
    client.get('/api/plans', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });

  it('GET /api/plans return [plan] when has plan', function(done) {
    var plan = new Plan();
    plan.cases = ['c1'];
    plan.devices = ['d1'];
    plan.actions = ['a1', 'a2'];
    plan.save().then(function(p) {
      client.get('/api/plans', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        expect(obj[0]._id.toString()).to.eql(p._id.toString());
        done();
      });
    });
  });

  it('GET /api/plans return [] when plan has been removed', function(done) {
    var plan = new Plan();
    plan.cases = ['c1'];
    plan.devices = ['d1'];
    plan.removed = true;
    plan.save().then(function(p) {
      client.get('/api/plans', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('POST /api/plans create the new plan', function(done) {
    client.post('/api/plans', {cases: ['c1'], devices: ['d1'], actions: ['a1'], labels: ['l1']}, function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      Plan.findOne({}, function(err, t) {
        expect(t.cases[0]).to.eql('c1');
        expect(t.devices[0]).to.eql('d1');
        expect(t.actions[0]).to.eql('a1');
        expect(t.labels[0]).to.eql('l1');
        done();
      });
    });
  });

  it('DELETE /api/plan/:id return 200 when plan has been removed', function(done) {
    var plan = new Plan();
    plan.cases = ['c1'];
    plan.devices = ['d1'];
    plan.removed = false;
    plan.save().then(function(p) {
      client.del('/api/plan/' + p._id, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        Plan.findOne({}, function(err, p) {
          expect(p.removed).to.eql(true);
          done();
        });
      });
    });
  });
});

