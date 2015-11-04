var Task = require('../../models').Task;

module.exports = {
    '/api/tasks/:id': {
        get: function(req, res, next) {
            // TODO: not implemented
            res.send({id: req.params.id});
            return next();
        },
    },
    '/api/tasks/:id/result': {
        post: function(req, res, next) {
            Task.findOne({id: req.params.id}, function(err, task) {
                if (err) {
                    return next(err);
                } else if (task === null) {
                    res.send(404, {'err': 'task ' + req.params.id + ' not found'});
                    return next();
                } else {
                    task.result = req.body;
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
