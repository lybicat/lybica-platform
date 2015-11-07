var restify = require('restify');
var expect = require('expect.js');
var Action = require('../../models').Action;

describe('/api/actions', function() {
    var client;

    before(function(done) {
        client = restify.createJsonClient({
            url: process.env.LYBICA_TEST_URL
        });
        done();
    });

    afterEach(function(done) {
        Action.remove(done);
    });

    it('GET /api/actions return [] when no remote actions', function(done) {
        client.get('/api/actions', function(err, req, res, obj) {
            expect(err).to.eql(null);
            expect(obj).to.eql([]);
            done();
        });
    });

    it('GET /api/actions return [xxx] when remote actions defined', function(done) {
        var action = new Action();
        action.name = 'just_for_test';
        action.id = 12345;
        action.desc = 'desc for test';
        action.exec = 'print("hello world")';
        action.save().then(function(a) {
            client.get('/api/actions', function(err, req, res, obj) {
                expect(err).to.eql(null);
                expect(obj.length).to.eql(1);
                expect(obj[0].name).to.eql('just_for_test');
                expect(obj[0].id).to.eql(12345);
                expect(obj[0].desc).to.eql('desc for test');
                expect(obj[0].exec).to.eql('print("hello world")');
                done();
            });
        });
    });
});

