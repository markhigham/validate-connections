#!/usr/bin/env node

const logger = require("../lib/logger")("/");
const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const _ = require("lodash");
const ConfigParser = require("../lib/config-parser");
const colors = require("colors");
const Validator = require("../lib/validator");

function showHelp() {
  console.log(`validate-connections configfile [-v values.config] [-f show-full-passwords]
configfile  path/to/web.config
    absolute or relative path to web.config or app.config

-v  values.config file
    path to transform file i.e. Web.Release.config

-f  show full passwords
    By defaults passwords are obfuscated. That's in case you are capturing the output as part of your CI process.
    But you already have access to the config files so this options displays the passwords

-h  show this help

    `);
}

if (argv.h) {
  showHelp();
  process.exit(0);
}

//Do we get the config filename
if (argv._.length === 0) {
  showHelp();
  process.exit(0);
}

//Get config file details
const configFile = argv._[0];
logger.debug(configFile);

if (!fs.existsSync(configFile)) {
  console.log(`${configFile} not found`);
  process.exit(0);
}

const configContents = fs.readFileSync(configFile, "utf8");
const parser = new ConfigParser();

const validator = new Validator();

validator
  .process(connection => {
    if (argv.f) {
      process.stdout.write(
        colors.white(connection.name) +
          " " +
          colors.gray(connection.originalConnectionString)
      );
    } else {
      process.stdout.write(
        colors.white(connection.name) +
          " " +
          colors.gray(connection.getSafeConnectionString())
      );
    }
  })
  .success(connection => {
    console.log(colors.green(" ok"));
  })
  .fail((err, connection) => {
    console.log(" " + colors.red(err));
  });

parser
  .parse(configContents)
  .then(connectionStrings => {
    return validator.start(connectionStrings);
  })
  .then(() => {
    // console.log(colors.green('ok'));
  })
  .catch(err => {
    logger.error(err);
    console.error(err);
    process.exit(-1);
  });
