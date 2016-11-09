#!/usr/bin/env node

var packageJson = require('../package.json')
var program = require('commander')
var helper = require('../lib/helper')

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
  .command('add-availability', 'add component availability.')
  .command('build', 'scan a node_modules folder for npm packages with the keyword "magnolia-light-module" (in package.json) and extract them to a directory of choice.')
  .command('create-component', 'create a component and optionally add availability for it.')
  .command('create-light-module', 'create a light module.')
  .command('create-page', 'create a page template.')
  .command('jumpstart', 'download and prepare Magnolia CMS for light dev.')
  .command('setup', 'extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to have a custom configuration.')
  .parse(process.argv)

var customizableCommands = ['jumpstart', 'create-light-module', 'create-page', 'create-component']
var availableCommands = customizableCommands.concat(['help', 'setup', 'build', 'add-availability'])

if (availableCommands.indexOf(program.args[0]) === -1) {
  helper.printError(program.args[0] + ' is not a valid command')
  program.outputHelp()
  process.exit(1)
}

if (customizableCommands.indexOf(program.args[0]) !== -1) {
  helper.printInfo('Using configuration at ' + helper.resolveMgnlCliJsonPath())
  helper.printInfo('Using prototypes at ' + helper.resolveMgnlCliPrototypesPath())
}
