const logger = require("./logger")("connection-string-setting");
const _ = require("lodash");

function ConnectionStringSetting(parsedConnectionString) {
  if (typeof parsedConnectionString === "undefined")
    throw "parsedConnectionString is required";

  // this.parsedConnectionString = parsedConnectionString;
  this.name = parsedConnectionString.name;
  this.originalConnectionString = parsedConnectionString.connectionString;
}

ConnectionStringSetting.prototype.explodeConnectionString = function(
  connectionString
) {
  const parts = this.originalConnectionString.split(";");
  return parts;
};

ConnectionStringSetting.prototype.getConnectionString = function(
  timeoutValueInMilliseconds = 5000
) {
  const parts = this.explodeConnectionString(this.originalConnectionString);
  const results = [];

  _.each(parts, part => {
    const trimmed = part.trim();
    if (!trimmed || trimmed.length === 0) return;

    if (trimmed.toLowerCase().startsWith("connection timeout")) return;

    results.push(part);
  });

  results.push("Connection Timeout=" + timeoutValueInMilliseconds);
  return results.join(";");
};

ConnectionStringSetting.prototype.getSafeConnectionString = function() {
  const parts = this.explodeConnectionString(this.originalConnectionString);
  const resultParts = [];

  _.each(parts, part => {
    const trimmed = part.trim();
    if (trimmed.toLowerCase().startsWith("password")) return;

    if (trimmed.length === 0) return;

    resultParts.push(part);
  });

  resultParts.push("Password=*****");
  logger.verbose(this.originalConnectionString);
  return resultParts.join(";");
};

module.exports = ConnectionStringSetting;
