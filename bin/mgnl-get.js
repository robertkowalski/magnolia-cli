#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed.js')

const installLightModule = require('../lib/installLightModule.js')
const packageJson = require('../package.json')

program
  .version(packageJson.version)
  .name('mgnl get')
  .usage('<templateName>')
  .description('Gets a light module from npm')
  .parse(process.argv)

installLightModule(program.args[0])
  .then(process.exit.bind(this, 0))
