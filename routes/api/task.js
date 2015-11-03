var Task = require('../../models').Task;

module.exports = {
    '/api/tasks/:tid': {
        get: function(req, res, next) {
            // TODO: not implemented
            res.send({id: req.params.tid});
            return next();
        },
    },
    '/api/tasks/:tid/result': {
        post: function(req, res, next) {
            // TODO: not implemented
            res.send(req.body);
            return next();
        }
    }
};
