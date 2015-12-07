/* jshint node: true */
'use strict';

var restify = require('restify');
var expect = require('expect.js');
var Task = require('../../models').Task;

describe('/api/tasks', function() {
  var client;

  before(function(done) {
    client = restify.createJsonClient({
      url: process.env.LYBICA_TEST_URL
    });
    done();
  });

  afterEach(function(done) {
    Task.remove({}, function(err) {
      expect(err).to.eql(null);
      done();
    });
  });

  it('POST /api/tasks create the new task', function(done) {
    client.post('/api/tasks', {caseset: ['c1'], device: ['d1'], build: '12345', actions: ['a1']}, function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      Task.findOne({}, function(err, t) {
        expect(t.build).to.eql('12345');
        expect(t.caseset[0]).to.eql('c1');
        expect(t.device[0]).to.eql('d1');
        expect(t.actions[0]).to.eql('a1');
        done();
      });
    });
  });

  it('GET /api/tasks return [] when no tasks defined', function(done) {
    client.get('/api/tasks', function(err, req, res, obj) {
      expect(err).to.eql(null);
      expect(res.statusCode).to.eql(200);
      expect(obj).to.eql([]);
      done();
    });
  });

  it('GET /api/tasks return [task] when has task in queue', function(done) {
    var task = new Task();
    task.caseset = ['c1'];
    task.device = ['d1'];
    task.save().then(function(t) {
      client.get('/api/tasks', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        expect(obj[0]._id.toString()).to.eql(t._id.toString());
        done();
      });
    });
  });

  it('GET /api/tasks return [] when no tasks in queue', function(done) {
    var task = new Task();
    task.caseset = ['c1'];
    task.device = ['d1'];
    task.result = {passed: false};
    task.done = true;
    task.save().then(function() {
      client.get('/api/tasks', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('GET /api/tasks/pending return [xxx] when unstarted tasks in queue', function(done) {
    var task = new Task();
    task.caseset = ['c1'];
    task.device = ['d1'];
    task.save().then(function() {
      client.get('/api/tasks/pending', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        done();
      });
    });
  });

  it('GET /api/tasks/pending return [] when only started task in queue', function(done) {
    var task = new Task();
    task.caseset = ['c1'];
    task.device = ['d1'];
    task.started = true;
    task.save().then(function() {
      client.get('/api/tasks/pending', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('GET /api/tasks/done return [] when only active task', function(done) {
    var task = new Task();
    task.done = false;
    task.save().then(function() {
      client.get('/api/tasks/done', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj).to.eql([]);
        done();
      });
    });
  });

  it('GET /api/tasks/done return [xxx] when done task exist', function(done) {
    var task = new Task();
    task.done = true;
    task.save().then(function() {
      client.get('/api/tasks/done', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj.length).to.eql(1);
        expect(obj[0].done).to.eql(true);
        done();
      });
    });
  });

  it('POST /api/task/:id/result to not found task return 404', function(done) {
    client.post('/api/task/563c0e4d6dd4bb864dc20565/result', {result: 'PASS'}, function(err, req, res, obj) {
      expect(err).not.to.eql(null);
      expect(res.statusCode).to.eql(404);
      done();
    });
  });

  it('POST /api/task/:id/result to exist task return 200', function(done) {
    var task = new Task();
    task.save(function(err, t) {
      expect(err).to.eql(null);
      client.post('/api/task/' + t._id + '/result', {passed: true}, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        Task.findOne({_id: t._id}, function(err, t) {
          expect(t.result.passed).to.eql(true);
          expect(t.passed).to.eql(true);
          expect(t.done).to.eql(true);
          done();
        });
      });
    });
  });

  it('PUT /api/task/:id/start to start one task return 200', function(done) {
    var task = new Task();
    task.caseset = ['c1'];
    task.device = ['d1'];
    task.started = false;
    task.save().then(function(t) {
      client.put('/api/task/' + t._id + '/start', function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        Task.findById(t._id)
        .then(function(t) {
          expect(t.started).to.eql(true);
          done();
        });
      });
    });
  });

  it('PUT /api/task/:id/done to mark one task done', function(done) {
    var task = new Task();
    task.started = true;
    task.done = false;
    task.save().then(function(t) {
      client.put('/api/task/' + t._id + '/done', function(err, req, res, obj)  {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        Task.findById(t._id)
        .then(function(t) {
          expect(t.done).to.eql(true);
          done();
        });
      });
    });
  });

  it('GET /api/task/:id return task infomation', function(done) {
    var task = new Task();
    task.caseset = ['c1'];
    task.save()
    .then(function(t) {
      client.get('/api/task/' + t._id, function(err, req, res, obj) {
        expect(err).to.eql(null);
        expect(res.statusCode).to.eql(200);
        expect(obj._id).to.eql(t._id.toString());
        expect(obj.caseset[0]).to.eql('c1');
        done();
      });
    });
  });

});

