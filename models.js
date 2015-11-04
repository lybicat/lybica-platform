var mongoose = require('mongoose');


// tasks
module.exports.Task = mongoose.model('task', {
    id: String,
    planid: String,
    triggerid: String,
    triggerat: Date,
    status: String,
    result: {
    }
});


// remote actions
module.exports.Action = mongoose.model('action', {
});
