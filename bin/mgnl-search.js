#!/usr/bin/env node
require('../lib/handleErrors.js')

var program = require('../lib/commander_shimmed.js')
var searchLightModule = require('../lib/searchLightModule.js')
var packageJson = require('../package.json')
var helper = require('../lib/helper')
var log = helper.logger
const i18next = require('../lib/bootstrap.js')()

var queryValue = ''

program
    .version(packageJson.version)
    .name('mgnl search')
    .usage('<query>')
    .arguments('<query>')
    .description(i18next.t('mgnl-search--cmd-description'))
    .action(function (query) {
      queryValue = query
    })
    .parse(process.argv)

searchLightModule
    .search(queryValue)
    .then(function (result) {
      log.info(result)
    })
