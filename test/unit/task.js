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

    it('GET /api/tasks/:id return the task infomation', function() {
        // TODO
    });

    it('POST /api/tasks/:id/result to not found task return 404', function(done) {
        client.post('/api/tasks/a1c98e/result', {result: 'PASS'}, function(err, req, res, obj) {
            expect(err).not.to.eql(null);
            expect(res.statusCode).to.eql(404);
            done();
        });
    });

    it('POST /api/tasks/:id/result to exist task return 200', function(done) {
        var task = new Task({id: 'a1c98e'});
        task.save(function(err) {
            expect(err).to.eql(null);
            client.post('/api/tasks/a1c98e/result', {result: 'PASS'}, function(err, req, res, obj) {
                expect(err).to.eql(null);
                expect(res.statusCode).to.eql(200);
                Task.findOne({id: 'a1c98e'}, function(err, t) {
                    expect(t.result.result).to.eql('PASS');
                    done();
                });
            });
        });
    });
});

