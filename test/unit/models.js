/* jshint node: true */
'use strict';

var expect = require('expect.js');
var Agent = require('../../models').Agent;

describe('models.Action', function() {
  var agent = {
    ip: '127.0.0.1',
    name: 'localhost',
    labels: ['a', 'b', 'c'],
    runners: {all: 5, running: 0}
  };

  var assertAgent = function(err, agent, done) {
    expect(err).to.eql(null);
    expect(agent.name).to.eql('localhost');
    expect(agent.ip).to.eql('127.0.0.1');
    expect(agent.labels.length).to.eql(3);
    expect(agent.available).to.eql(true);
    expect(agent.runners.all).to.eql(5);
    expect(agent.runners.running).to.eql(0);
    done();
  };


  afterEach(function(done) {
    Agent.remove(done);
  });

  it('Action.createOrUpdate will create new action if not exist', function(done) {
    Agent.createOrUpdate('127.0.0.1', agent, function(err, agent) {
      assertAgent(err, agent, done);
    });
  });

  it('Action.createOrUpdate will update exist action', function(done) {
    var oldAgent = new Agent();
    oldAgent.ip = '127.0.0.1';
    oldAgent.name = 'unittest';
    oldAgent.labels = [];
    oldAgent.available = false;
    oldAgent.runners = {all: 1, running: 0};
    oldAgent.save().then(function() {
      Agent.createOrUpdate('127.0.0.1', agent, function(err, agent) {
        assertAgent(err, agent, done);
      });
    });
  });
});
