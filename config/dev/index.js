'use strict'
var _ = require('lodash');

var config = {
    env: 'dev'
};

config = _.merge({}, require('../base'), config);

module.exports = config;
