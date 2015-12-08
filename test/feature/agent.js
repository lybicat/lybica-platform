/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Agent = require('../../models').Agent;

describe('/api/agents', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Agent.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('GET /api/agents return [] if no agent defined', function(done) {
    client.get('/api/agents', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });

  it('GET /api/agents return [xxx] if agent defined', function(done) {
    var agent = new Agent();
    agent.ip = '128.1.1.1';
    agent.name = 'unittest';
    agent.labels = ['linux', 'node'];
    agent.available = true;
    agent.runners = {all: 5, running: 1};

    agent.save().then(function(){
      client.get('/api/agents', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        expect(obj[0].ip).to.eql('128.1.1.1');
        expect(obj[0].name).to.eql('unittest');
        expect(obj[0].available).to.eql(true);
        expect(obj[0].runners.running).to.eql(1);
        done();
      });
    });
  });
});

