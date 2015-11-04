var mongoose = require('mongoose');


module.exports.Task = mongoose.model('task', {
    id: String,
    planid: String,
    triggerid: String,
    triggerat: Date,
    status: String,
    result: {
    }
});
