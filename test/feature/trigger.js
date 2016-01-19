/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Trigger = require('../../models').Trigger;

describe('/api/triggers', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Trigger.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('GET /api/triggers return [] when no triggers defined', function(done) {
    client.get('/api/triggers', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });

  it('GET /api/triggers return [trigger] when has trigger', function(done) {
    var trigger = new Trigger();
    trigger.name = 'unittest';
    trigger.type = 'svn';
    trigger.url = 'http://svn.test';
    trigger.save().then(function(p) {
      client.get('/api/triggers', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        expect(obj[0].name).to.eql('unittest');
        expect(obj[0].type).to.eql('svn');
        expect(obj[0].url).to.eql('http://svn.test');
        done();
      });
    });
  });

  it('GET /api/triggers return [] when trigger has been removed', function(done) {
    var trigger = new Trigger();
    trigger.removed = true;
    trigger.save().then(function(p) {
      client.get('/api/triggers', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('GET /api/triggers?name=xxx return [] when trigger name not matched', function(done) {
    var trigger = new Trigger();
    trigger.name = 'yyy';
    trigger.save().then(function(p) {
      client.get('/api/triggers?name=xxx', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('POST /api/triggers create the new trigger', function(done) {
    client.post('/api/triggers', {name: 'unittest', type: 'git', url: 'xxx.test'}, function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      Trigger.findOne({}, function(err, t) {
        expect(t.name).to.eql('unittest');
        expect(t.type).to.eql('git');
        expect(t.url).to.eql('xxx.test');
        done();
      });
    });
  });

  it('DELETE /api/trigger/:id return 200 when trigger has been removed', function(done) {
    var trigger = new Trigger();
    trigger.removed = false;
    trigger.save().then(function(p) {
      client.del('/api/trigger/' + p._id, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        Trigger.findOne({}, function(err, p) {
          expect(p.removed).to.eql(true);
          done();
        });
      });
    });
  });

  it('GET /api/trigger/:id return 404 when trigger not exist', function(done) {
    client.get('/api/trigger/56790cf65268386011e96dcb', function(err, req, res, obj) {
      expect(err).not.to.eql(null);
      expect(res.statusCode).to.eql(404);
      done();
    });
  });

  it('GET /api/trigger/:id return trigger when trigger defined', function(done) {
    var trigger = new Trigger();
    trigger.name = 'unittest';
    trigger.type = 'svn';
    trigger.url = 'http://svn.test';
    trigger.save().then(function(p) {
      client.get('/api/trigger/' + p._id, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.name).to.eql('unittest');
        expect(obj.type).to.eql('svn');
        expect(obj.url).to.eql('http://svn.test');
        done();
      });
    });
  });

  it('POST /api/trigger/:id update trigger field', function(done) {
    var trigger = new Trigger();
    trigger.name = 'unittest';
    trigger.type = 'svn';
    trigger.url = 'http://svn.test';
    trigger.save()
    .then(function(p) {
      client.post('/api/trigger/' + p._id, {name: 'unittest2', type: 'git', url: 'http://git.test'}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.name).to.eql('unittest2');
        expect(obj.type).to.eql('git');
        expect(obj.url).to.eql('http://git.test');
        done();
      });
    });
  });
});

