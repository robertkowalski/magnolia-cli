#!/usr/bin/env node

require('../lib/handleErrors.js')
const i18next = require('../lib/bootstrap.js')()

var program = require('../lib/commander_shimmed.js')
var addAvailability = require('../lib/addAvailability.js')

var packageJson = require('../package.json')

program
  .version(packageJson.version)
  .name('mgnl add-availability')
  .usage('<[module-id:]path-to-component> <path-to-page[@area]> [options]')
  .description(i18next.t('mgnl-add-availability--cmd-description'))
  .option('-g, --autogenerate', i18next.t('mgnl-add-availability--cmd-option-autogenerate'))
  .option('-p, --path <path>', i18next.t('mgnl-add-availability--cmd-option-path'))
  .parse(process.argv)

var args = addAvailability.validateAndResolveArgs(program)
addAvailability.add(args)
