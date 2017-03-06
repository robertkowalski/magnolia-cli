#!/usr/bin/env node

require('../lib/handleErrors.js')

var program = require('../lib/commander_shimmed.js')
var createLightModule = require('../lib/createLightModule.js')

var packageJson = require('../package.json')
const i18next = require('../lib/bootstrap.js')()

program
  .version(packageJson.version)
  .name('mgnl create-light-module')
  .usage('[moduleName] [options]')
  .description(i18next.t('mgnl-create-light-module--cmd-option-description'))
  .option('-p, --path <path>', i18next.t('mgnl-create-light-module--cmd-option-path'))
  .parse(process.argv)

var args = createLightModule.validateAndResolveArgs(program)
createLightModule.create(args, function (err) {
  if (err) throw err
})
