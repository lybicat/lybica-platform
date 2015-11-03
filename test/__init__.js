var mongoose = require('mongoose');

before(function(done) {
    process.env.LYBICA_API_PORT = Math.round(Math.random() * 10000) + 10000;
    process.env.LYBICA_MONGO_URL = 'mongodb://127.0.0.1:27017/lybica_unittest' + Date.now();
    process.env.LYBICA_TEST_URL = 'http://127.0.0.1:' + process.env.LYBICA_API_PORT + '/api';
    var app = require('../app');
    done();
});

after(function(done) {
    var db = mongoose.connect(process.env.LYBICA_MONGO_URL, function(err) {
        mongoose.connection.db.dropDatabase(done);
    });
});
