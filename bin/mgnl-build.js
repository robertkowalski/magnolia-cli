#!/usr/bin/env node

require('../lib/handleErrors.js')

var packageJson = require('../package.json')
var program = require('../lib/commander_shimmed.js')
var build = require('@magnolia/magnolia-build')
var helper = require('../lib/helper')

const i18next = require('../lib/bootstrap.js')()

// TODO: change the usage text!!!
program
  .version(packageJson.version)
  .name('mgnl build')
  .description(i18next.t('mgnl-build--cmd-description'))
  .option('-n, --node-modules <path>', i18next.t('mgnl-build--cmd-option-node-modules-path'))
  .option('-p, --path <path>', i18next.t('mgnl-build--cmd-option-path'))
  .parse(process.argv)

var node_modules = program.nodeModules || 'node_modules'
var lightModulesRoot = program.path || helper.defaultLightModulesRootName

build(node_modules, lightModulesRoot)
