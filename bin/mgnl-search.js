#!/usr/bin/env node
require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed.js')
const searchLightModule = require('../lib/searchLightModule.js')
const packageJson = require('../package.json')
const helper = require('../lib/helper')
const log = helper.logger
const i18next = require('../lib/bootstrap.js')()

let queryValue = ''

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
