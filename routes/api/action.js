var Action = require('../../models').Action;

module.exports = {
    '/api/actions': {
        get: function(req, res, next) {
            Action.find({}, function(err, actions) {
                if (err) return next(err);
                res.send(actions);
                return next();
            });
        },
    },
};
