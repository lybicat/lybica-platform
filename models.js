var mongoose = require('mongoose');


// tasks
var taskSchema = mongoose.Schema({
    id: String,
    planid: String,
    triggerid: String,
    triggerat: Date,
    status: String,
    result: {
    }
});
taskSchema.index({id: 1});
module.exports.Task = mongoose.model('task', taskSchema);


// remote actions
var actionSchema = mongoose.Schema({});
module.exports.Action = mongoose.model('action', actionSchema);
