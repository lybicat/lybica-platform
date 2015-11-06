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

    it('GET /api/actions return all remote actions', function(done) {
        client.get('/api/actions', function(err, req, res, obj) {
            expect(err).to.eql(null);
            expect(obj).to.eql([]);
            done();
        });
    });
});

