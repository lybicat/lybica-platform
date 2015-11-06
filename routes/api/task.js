var Task = require('../../models').Task;

module.exports = {
    '/api/tasks': {
        post: function(req, res, next) {
            var task = new Task();
            if (req.body.triggerby) task.triggerby = req.body.triggerby;
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
            Task.findOne({_id: req.params.id}, function(err, task) {
                if (err) {
                    return next(err);
                } else if (task === null) {
                    res.send(404, {'err': 'task ' + req.params.id + ' not found'});
                    return next();
                } else {
                    task.result = req.body;
                    task.markModified('result');
                    if (task.result.passed === true) {
                        task.passed = true;
                    }
                    task.save(function(err, t) {
                        if (err) return next(err);
                        res.send(200, {});
                        return next();
                    });
                }
            });
        }
    }
};
