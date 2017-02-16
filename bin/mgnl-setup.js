#!/usr/bin/env node

require('../lib/handleErrors.js')

var packageJson = require('../package.json')
var program = require('../lib/commander_shimmed.js')
var log = require('../lib/helper').logger

const removeAlert = 'This command was replaced, please use "customize-local-config" instead'

program
  .version(packageJson.version)
  .name('mgnl setup')
  .description(removeAlert)
  .parse(process.argv)

log.important(removeAlert)
