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
  .command('jumpstart', 'download and setup a Magnolia CMS instance for development.')
  .command('start', 'start up a Magnolia CMS instance. To stop it, enter CTRL+C')
  .command('get', 'Gets a light module from npm')
  .command('add-availability', 'add component availability.')
  .command('build', 'scan a node_modules folder for npm packages with the keyword "magnolia-light-module" (in package.json) and extract them to a directory of choice.')
  .command('create-component', 'create a component and optionally add availability for it.')
  .command('create-light-module', 'create a light module.')
  .command('create-page', 'create a page template.')
  .command('setup', 'extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to have a custom configuration.')
  .parse(process.argv)

var customizableCommands = ['jumpstart', 'create-light-module', 'create-page', 'create-component']
var availableCommands = customizableCommands.concat(['help', 'get', 'setup', 'build', 'add-availability', 'start'])

if (availableCommands.indexOf(program.args[0]) === -1) {
  log.error(program.args[0] + ' is not a valid command')
  program.outputHelp()
  process.exit(1)
}

if (customizableCommands.indexOf(program.args[0]) !== -1) {
  log.info('Using configuration at ' + helper.resolveMgnlCliJsonPath())
  log.info('Using prototypes at ' + helper.resolveMgnlCliPrototypesPath())
}
