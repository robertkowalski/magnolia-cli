#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed.js')
const createComponent = require('../lib/createComponent.js')
const helper = require('../lib/helper')
const log = helper.logger

const packageJson = require('../package.json')

const i18next = require('../lib/bootstrap.js')()

const matchesPattern = function (val) {
  if (helper.matchesDefinitionReferenceWithAreaPattern(val) || helper.matchesDefinitionReferenceWithoutAreaPattern(val)) {
    return val
  }
  log.error('Expected a value in the form e.g. <path-to-page[@area]> but was %s', val)
  return false
}

program
  .version(packageJson.version)
  .name('mgnl create-component')
  .usage('<name> [options]')
  .description(i18next.t('mgnl-create-component--cmd-option-description'))
  .option('-a, --available <path-to-page[@area]>', i18next.t('mgnl-create-component--cmd-option-available'), matchesPattern)
  .option('-g, --autogenerate <path-to-page[@area]>', i18next.t('mgnl-create-component--cmd-option-autogenerate'), matchesPattern)
  .option('-p, --path <path>', i18next.t('mgnl-create-component--cmd-option-path'))
  .option('-P, --prototype <name>', i18next.t('mgnl-create-component--cmd-option-prototype'))
  .parse(process.argv)

const args = createComponent.validateAndResolveArgs(program)
createComponent.create(args)
