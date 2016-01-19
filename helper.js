/* jshint node: true */
'use strict';

module.exports.filterObjects = function(model, filterCond, sortBy, req, res, next) {
  model.paginate(filterCond, {
    page: req.params.page || 1,
    limit: req.params.limit || 30,
    sortBy: sortBy,
    lean: true
  }, function(err, builds) {
    if (err) return next(err);

    return res.send(builds);
  });
}
