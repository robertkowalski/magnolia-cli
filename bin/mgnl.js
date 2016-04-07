#!/usr/bin/env node

var packageJson = require('../package.json')
var program = require('commander')
var helper = require('./helper')

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
  .command('jumpstart', 'prepare Magnolia CMS for light dev')
  .command('setup', 'extract prototypes and packge.json of CLI tools so that they can be customized')
  .command('create-light-module', 'create a light module')
  .command('create-page', 'create a page template')
  .command('create-component', 'create a component and optionally add availability for it')
  .command('add-availability', 'add component availability')
  .parse(process.argv)

var availableCommands = ['help', 'jumpstart', 'setup', 'create-light-module', 'create-page', 'create-component', 'add-availability']

if (availableCommands.indexOf(program.args[0]) === -1) {
  helper.printError(program.args[0] + ' is not a valid command')
  program.outputHelp()
  process.exit(1)
}
