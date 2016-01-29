var log4js = require('log4js');

module.exports = function(name) {
  var name = name || 'default';

  return log4js.getLogger(name);
}
