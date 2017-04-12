#!/usr/bin/env node

require('../lib/handleErrors.js')

const packageJson = require('../package.json')
const program = require('../lib/commander_shimmed.js')
const log = require('../lib/helper').logger
const i18next = require('../lib/bootstrap.js')()

const removeAlert = i18next.t('mgnl-setup--cmd-option-description-replaced')

program
  .version(packageJson.version)
  .name('mgnl setup')
  .description(removeAlert)
  .parse(process.argv)

log.important(removeAlert)
