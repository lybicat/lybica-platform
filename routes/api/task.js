var Task = require('../../models').Task;

module.exports = {
    '/api/tasks': {
        get: function(req, res, next) {
            Task.find({done: false}, function(err, tasks) {
                if (err) return next(err);
                res.send(tasks);
                return next();
            });
        },
        post: function(req, res, next) {
            var task = new Task();
            if (req.body.triggerby) task.triggerby = req.body.triggerby;
            if (req.body.build) task.build = req.body.build;
            task.caseset = req.body.caseset;
            task.device = req.body.device;
            task.save(function(err, t) {
                if (err) return next(err);
                res.send(200, {id: t._id});
                return next();
            });
        },
    },
    '/api/tasks/:id/result': {
        post: function(req, res, next) {
            Task.findById(req.params.id)
            .then(function(task) {
                if (task === null) {
                    res.send(404, {'err': 'task ' + req.params.id + ' not found'});
                    return next();
                }
                task.result = req.body;
                task.markModified('result');
                if (task.result.passed === true) {
                    task.passed = true;
                }
                task.done = true;
                task.save(function(err, t) {
                    if (err) return next(err);
                    res.send(200, {});
                    return next();
                });
            });
        }
    }
};
