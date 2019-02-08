const logger = require("./logger")("config-parser");
const parseString = require("xml2js").parseString;
const ConnectionStringSetting = require("./connection-string-setting");
const _ = require("lodash");

class ConfigParser {
  parse(configXmlText) {
    if (typeof configXmlText === "undefined" || configXmlText.length === 0) {
      throw "configXmlText is required";
    }

    return new Promise((resolve, reject) => {
      parseString(configXmlText, (err, result) => {
        if (err) {
          logger.error(err);
          reject(err);
          return;
        }

        const connectionStrings = [];

        if (typeof result.configuration === "undefined") {
          reject("Missing Configuration section in config file");
          return;
        }

        if (
          typeof result.configuration.connectionStrings === "undefined" ||
          result.configuration.connectionStrings.length === 0
        ) {
          resolve(connectionStrings);
          return;
        }

        if (
          typeof result.configuration.connectionStrings[0].add == "undefined" ||
          result.configuration.connectionStrings[0].add.length === 0
        ) {
          resolve(connectionStrings);
          return;
        }

        _.each(result.configuration.connectionStrings[0].add, cn => {
          const connection = new ConnectionStringSetting(cn["$"]);
          connectionStrings.push(connection);
        });

        const sorted = _.sortBy(connectionStrings, cs => {
          return cs.name;
        });

        // because the validator pops items from this array
        resolve(_.reverse(sorted));
      });
    });
  }
}

module.exports = ConfigParser;
