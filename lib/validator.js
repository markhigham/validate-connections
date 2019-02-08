const logger = require("./logger")("validator");
const _ = require("lodash");
const async = require("async");
const sql = require("mssql");

function Validator() {
  let _connections;

  const methods = {
    process: function() {},
    success: function() {},
    fail: function() {},
    error: function() {}
  };

  function test() {
    return _connections.length > 0;
  }

  function iteratee(callback) {
    const connection = _connections.pop();
    const sql = require("mssql");

    logger.info(connection.name);
    methods.process.apply(methods, [connection]);

    sql
      .connect(connection.getConnectionString())
      .then(pool => {
        methods.success.apply(methods, [connection]);
        return pool;
      })
      .then(() => {
        sql.close();
        callback(null);
      })
      .catch(err => {
        sql.close();
        methods.fail.apply(methods, [err, connection]);
        logger.error(err);
        callback(null);
      });
  }

  function start(connectionStrings) {
    if (typeof connectionStrings === "undefined")
      throw "connectionStrings is required";

    _connections = _.cloneDeep(connectionStrings);

    return new Promise((resolve, reject) => {
      async.whilst(test, iteratee, (err, n) => {
        if (err) {
          logger.error(err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  const self = {
    start: start,
    process: function(callback) {
      methods.process = callback;
      return self;
    },
    success: function(callback) {
      methods.success = callback;
      return self;
    },
    fail: function(callback) {
      methods.fail = callback;
      return self;
    }
  };

  return self;
}

module.exports = Validator;
