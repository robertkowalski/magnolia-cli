#!/usr/bin/env node

'use strict'

// ES5 to run on older Node versions
const semver = require('semver')
const version = process.version.replace(/^v/, '')
const packageJson = require('../package.json')

const requiredVersion = packageJson.engines.node
if (!semver.satisfies(version, requiredVersion)) {
  console.error('[Error]', 'mgnl requires Node version', requiredVersion, '.')
  console.error('Please install the latest Node LTS from https://nodejs.org')
  process.exit(1)
}

require('../lib/handleErrors.js')

const program = require('commander')
const helper = require('../lib/helper')
const log = helper.logger
const commands = require('../lib/commands').commands
const customizableCommandNames = require('../lib/commands').getCustomizableCommandNames()
const allCommandNames = require('../lib/commands').getAllCommandNames()
const i18next = require('../lib/bootstrap.js')()

/**
 * This is the entry point for the Magnolia CLI npm package. It uses https://www.npmjs.com/package/commander
 * to implement a GIT-like subcommand style, so that it can be invoked on the command line like this
 * mgnl [subcommand] [options]
 * Commander expects the subcommand javascript files to be in the same directory as this file and be named
 * like this 'mgnl-subcommandname', i.e. the subcommand file name must be preceded by 'mgnl-' (name of this file + dash).
 * For instance, the 'create-page' subcommand js is mgnl-create-page.js.
 */
program
  .version(packageJson.version)
  .usage('<command> [options]')
  .description(i18next.t('mgnl--cmd-description'))

for (let i in commands) {
  if (commands[i].implicit) {
    continue
  }
// noHelp will register the command but won't show it when doing 'mgnl [--help]'
  program.command(i, commands[i].description, {noHelp: commands[i].noHelp})
}

program.on('--help', function () {
  console.log(`  ${helper.getEnv()}`)
  console.log()
})

program.parse(process.argv)

if (!allCommandNames.includes(program.args[0])) {
  log.error(i18next.t('mgnl--not-a-valid-cmd', { cmd: program.args[0], interpolation: {escapeValue: false} }))
  program.outputHelp()
  process.exit(1)
}

if (customizableCommandNames.includes(program.args[0])) {
  log.important(i18next.t('mgnl--using-config-at', { path: helper.resolveMgnlCliJsonPath(), interpolation: { escapeValue: false } }))
  log.important(i18next.t('mgnl--using-prototype-at', { path: helper.resolveMgnlCliPrototypesPath(), interpolation: { escapeValue: false } }))
}
