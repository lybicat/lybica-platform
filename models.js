var mongoose = require('mongoose');
var ObjectId = mongoose.SchemaTypes.ObjectId;
var Mixed = mongoose.SchemaTypes.Mixed;


// tasks
var taskSchema = mongoose.Schema({
    //planid: ObjectId, //TODO
    triggerby: {type: String, default: 'SYSTEM'},
    triggerat: {type: Date, default: Date.now},
    started: {type: Boolean, default: false},
    startat: Date,
    passed: {type: Boolean, default: false},
    done: {type: Boolean, default: false},
    build: {type: String, default: ''}, // TODO
    caseset: [String],
    device: [String],
    actions: [String],
    result: Mixed
});
//taskSchema.index({planid: 1}); //TODO
module.exports.Task = mongoose.model('task', taskSchema);


// remote actions
var actionSchema = mongoose.Schema({});
module.exports.Action = mongoose.model('action', actionSchema);

