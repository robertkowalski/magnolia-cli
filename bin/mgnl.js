#!/usr/bin/env node

// ES5 to run on older Node versions
var semver = require('semver')
var version = process.version.replace(/^v/, '')
var packageJson = require('../package.json')

var requiredVersion = packageJson.engines.node
if (!semver.satisfies(version, requiredVersion)) {
  console.error('[Error]', 'mgnl requires Node version', requiredVersion, '.')
  console.error('Please install the latest Node LTS from https://nodejs.org')
  process.exit(1)
}

require('../lib/handleErrors.js')

var program = require('commander')
var helper = require('../lib/helper')
var log = helper.logger
var commands = require('../lib/commands').commands
const customizableCommandNames = require('../lib/commands').getCustomizableCommandNames()
const allCommandNames = require('../lib/commands').getAllCommandNames()

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
  .description(packageJson.description)
for (let i in commands) {
  if (commands[i].implicit) {
    continue
  }
// noHelp will register the command but won't show it when doing 'mgnl [--help]'
  program.command(i, commands[i].description, {noHelp: commands[i].noHelp})
}
program.parse(process.argv)

if (!allCommandNames.includes(program.args[0])) {
  log.error(program.args[0] + ' is not a valid command')
  program.outputHelp()
  process.exit(1)
}

if (customizableCommandNames.includes(program.args[0])) {
  log.important('Using configuration at ' + helper.resolveMgnlCliJsonPath())
  log.important('Using prototypes at ' + helper.resolveMgnlCliPrototypesPath())
}
