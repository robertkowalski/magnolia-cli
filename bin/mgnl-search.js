#!/usr/bin/env node
var program = require('../lib/commander_shimmed.js')
var searchLightModule = require('../lib/searchLightModule.js')
var packageJson = require('../package.json')
var helper = require('../lib/helper')
var log = helper.logger
require('../lib/handleErrors.js')

var queryValue = ''

program
    .version(packageJson.version)
    .name('mgnl search')
    .usage('<query>')
    .arguments('<query>')
    .description('Searches light modules with given query.')
    .action(function (query) {
      queryValue = query
    })
    .parse(process.argv)

searchLightModule
    .search(queryValue)
    .then(function (result) {
      log.info(result)
    })
