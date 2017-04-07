#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed.js')

const createPage = require('../lib/createPage.js')
const packageJson = require('../package.json')
const i18next = require('../lib/bootstrap.js')()

program
  .version(packageJson.version)
  .name('mgnl create-page')
  .usage('<templateName> [options]')
  .description(i18next.t('mgnl-create-page--cmd-option-description'))
  .option('-p, --path <path>', i18next.t('mgnl-create-page--cmd-option-path'))
  .option('-P, --prototype <name>', i18next.t('mgnl-create-page--cmd-option-prototype'))
  .parse(process.argv)

const args = createPage.validateAndResolveArgs(program)
createPage.create(args)
