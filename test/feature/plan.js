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

  it('GET /api/plans?name=xxx return [] when plan name not matched', function(done) {
    var plan = new Plan();
    plan.name = 'yyy';
    plan.save().then(function(p) {
      client.get('/api/plans?name=xxx', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('POST /api/plans create the new plan', function(done) {
    client.post('/api/plans', {cases: [{repo: 'r1', expr: 'c1'}], devices: ['d1'], actions: ['a1'], labels: ['l1']}, function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      Plan.findOne({}, function(err, t) {
        expect(t.cases[0].repo).to.eql('r1');
        expect(t.cases[0].expr).to.eql('c1');
        expect(t.devices[0]).to.eql('d1');
        expect(t.actions[0]).to.eql('a1');
        expect(t.labels[0]).to.eql('l1');
        done();
      });
    });
  });

  it('DELETE /api/plan/:id return 200 when plan has been removed', function(done) {
    var plan = new Plan();
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

  it('GET /api/plan/:id return 404 when plan not exist', function(done) {
    client.get('/api/plan/56790cf65268386011e96dcb', function(err, req, res, obj) {
      expect(err).not.to.eql(null);
      expect(res.statusCode).to.eql(404);
      done();
    });
  });

  it('GET /api/plan/:id return plan when plan defined', function(done) {
    var plan = new Plan();
    plan.cases = [{repo: 'r1', expr: 'c1'}];
    plan.devices = ['d1'];
    plan.actions = ['a1'];
    plan.labels = ['l1'];
    plan.save().then(function(p) {
      client.get('/api/plan/' + p._id, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.cases[0].repo).to.eql('r1');
        expect(obj.cases[0].expr).to.eql('c1');
        expect(obj.devices[0]).to.eql('d1');
        expect(obj.labels[0]).to.eql('l1');
        done();
      });
    });
  });

  it('POST /api/plan/:id update plan field', function(done) {
    var plan = new Plan();
    plan.cases = [{repo: 'r1', expr: 'c1'}];
    plan.devices = ['d1'];
    plan.actions = ['a1'];
    plan.labels = ['l1'];
    plan.save()
    .then(function(p) {
      client.post('/api/plan/' + p._id, {cases: [{repo: 'r1', expr: 'c1'}], devices: [], actions: [], labels: ['l2']}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.cases[0].repo).to.eql('r1');
        expect(obj.cases[0].expr).to.eql('c1');
        expect(obj.devices).to.eql([]);
        expect(obj.actions).to.eql([]);
        expect(obj.labels[0]).to.eql('l2');
        done();
      });
    });
  });
});

