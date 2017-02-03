#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed.js')

const installLightModule = require('../lib/installLightModule.js')
const packageJson = require('../package.json')

const path = require('path')

program
  .version(packageJson.version)
  .name('mgnl get')
  .usage('[--path]')
  .description('Gets a light module from npm')
  .option('-p, --path <path>', 'The path to the light modules folder')
  .parse(process.argv)

function getPath (p) {
  if (!p) return process.cwd()

  return path.resolve(program.path)
}

const opts = {
  lightModulesFolder: getPath(program.path)
}

installLightModule(program.args[0], opts)
  .then(process.exit.bind(this, 0))
