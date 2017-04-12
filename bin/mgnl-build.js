#!/usr/bin/env node

require('../lib/handleErrors.js')

const packageJson = require('../package.json')
const program = require('../lib/commander_shimmed.js')
const build = require('@magnolia/magnolia-build')
const helper = require('../lib/helper')

const i18next = require('../lib/bootstrap.js')()
const MgnlCliError = helper.MgnlCliError

program
  .version(packageJson.version)
  .name('mgnl build')
  .description(i18next.t('mgnl-build--cmd-description'))
  .option('-n, --node-modules <path>', i18next.t('mgnl-build--cmd-option-node-modules-path'))
  .option('-p, --path <path>', i18next.t('mgnl-build--cmd-option-path'))
  .parse(process.argv)

const nodeModules = program.nodeModules || 'node_modules'
const lightModulesRoot = program.path || helper.defaultLightModulesRootName

try {
  build(nodeModules, lightModulesRoot)
} catch (e) {
  if (e.code === 'ENOENT') {
    throw new MgnlCliError(
      i18next.t('mgnl-build--error-no-node-modules-dir'),
      true
    )
  }

  throw e
}
