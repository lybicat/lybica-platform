/* jshint node: true */
'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.SchemaTypes.ObjectId;
var Mixed = mongoose.SchemaTypes.Mixed;
var mongoosePaginate = require('mongoose-paginate');


// tasks
var taskSchema = mongoose.Schema({
  planid: ObjectId,
  planname: String,
  triggerby: {type: String, default: 'SYSTEM'}, // TODO: change to mixed type
  triggerat: {type: Date, default: Date.now},
  started: {type: Boolean, default: false},
  startat: Date,
  passed: {type: Boolean, default: false},
  done: {type: Boolean, default: false},
  doneat: Date,
  aborted: {type: Boolean, default: false},
  abortat: Date,
  abortby: String,
  build: {type: String, default: ''},
  cases: [Mixed],
  devices: [String],
  actions: [String],
  labels: [String], // from labels of devices
  consolelink: {type: String, default: ''}, // set when task start
  loglink: {type: String, default: ''}, // set when task done
  result: Mixed,
  agent: String
});
taskSchema.index({planid: 1, build: 1, agent: 1});
taskSchema.plugin(mongoosePaginate);
module.exports.Task = mongoose.model('task', taskSchema);


// remote actions
var actionSchema = mongoose.Schema({
  name: String,
  id: Number,
  desc: String,
  exec: String,
  createby: String,
  createat: {type: Date, default: Date.now},
  updateat: {type: Date, default: Date.now}
});
module.exports.Action = mongoose.model('action', actionSchema);


// agents
var agentSchema = mongoose.Schema({
  name: String,
  ip: String,
  available: {type: Boolean, default: false},
  labels: [String],
  createat: {type: Date, default: Date.now},
  updateat: {type: Date, default: Date.now},
  runners: {
    all: Number,
    running: Number
  }
});

agentSchema.statics.createOrUpdate = function(ip, data, callback) {
  this.findOne({ip: ip}, function(err, agent) {
    if (err) return callback(err);

    if (agent === null) agent = new Agent();

    agent.ip = ip;
    agent.name = data.name;
    agent.available = data.available === undefined ? true : data.available;
    agent.labels = data.labels;
    agent.updateat = Date.now();
    agent.runners = data.runners;

    agent.save(function(err, a) {
      callback(err, a);
    });
  });
};

var Agent = module.exports.Agent = mongoose.model('agent', agentSchema);

// plans
var planSchema = mongoose.Schema({
  name: String,
  removed: {type: Boolean, default: false},
  createby: {type: String, default: 'SYSTEM'},
  createat: {type: Date, default: Date.now},
  updateby: {type: String, default: 'SYSTEM'},
  updateat: {type: Date, default: Date.now},
  cases: [Mixed],
  devices: [String],
  actions: [String],
  labels: [String],
  parallel: {type: Boolean, default: false}
});
planSchema.plugin(mongoosePaginate);
module.exports.Plan = mongoose.model('plan', planSchema);

// sw builds
var buildSchema = mongoose.Schema({
  name: String,
  createat: {type: Date, default: Date.now},
  tasks: [ObjectId],
  labels: [String],
});
buildSchema.plugin(mongoosePaginate);
buildSchema.index({name: 1});
module.exports.Build = mongoose.model('build', buildSchema);

// resources like test PC, router, .etc
var resourceSchema = mongoose.Schema({
  name: String,
  ip: String,
  labels: [String],
  removed: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  createby: {type: String, default: 'SYSTEM'},
  createat: {type: Date, default: Date.now},
  updateby: {type: String, default: 'SYSTEM'},
  updateat: {type: Date, default: Date.now},
  reserveby: String,
  reserveat: Date,
  reserveexpired: Date,
  reservetoken: String
});
resourceSchema.plugin(mongoosePaginate);
module.exports.Resource = mongoose.model('resource', resourceSchema);

// cases
var caseSchema = mongoose.Schema({
  name: String,
  repository: Mixed,
  labels: [String],
  removed: {type: Boolean, default: false},
  createby: {type: String, default: 'SYSTEM'},
  createat: {type: Date, default: Date.now},
  updateby: {type: String, default: 'SYSTEM'},
  updateat: {type: Date, default: Date.now},
});
caseSchema.plugin(mongoosePaginate);
module.exports.Case = mongoose.model('case', caseSchema);


// triggers
var triggerSchema = mongoose.Schema({
  name: String,
  type: String,
  url: String,
  createby: {type: String, default: 'SYSTEM'},
  createat: {type: Date, default: Date.now},
  updateby: {type: String, default: 'SYSTEM'},
  updateat: {type: Date, default: Date.now},
  disabled: {type: Boolean, default: false},
  removed: {type: Boolean, default: false},
});
triggerSchema.plugin(mongoosePaginate);
module.exports.Trigger = mongoose.model('trigger', triggerSchema);

