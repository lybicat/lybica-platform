/* jshint node: true */
'use strict';

module.exports.PORT = process.env.LYBICA_API_PORT || 3000;

module.exports.DB_URL = process.env.LYBICA_MONGO_URL || 'mongodb://127.0.0.1:27017/lybica';

if (process.env.LYBICA_TEST_URL !== undefined) {
  module.exports.LOG4JS_SETTINGS = {
    appenders: [
      {type: 'console'}
    ],
    replaceConsole: true
  }
} else {
  module.exports.LOG4JS_SETTINGS = {
    appenders: [
      {
        type: 'file',
        filename: __dirname + '/logs/access.log',
        maxLogSize: 50 * 1024 * 1024,
        backups: 4
      },
      {
        type: 'logLevelFilter',
        level: 'ERROR',
        appender: {
          type: 'file',
          filename: __dirname + '/logs/error.log',
          maxLogSize: 50 * 1024 * 1024,
          backups: 4
        }
      }
    ],
    replaceConsole: true
  }
}
