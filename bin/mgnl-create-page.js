#!/usr/bin/env node

require('../lib/handleErrors.js')

var program = require('commander')

var createPage = require('../lib/createPage.js')
var packageJson = require('../package.json')

program
  .version(packageJson.version)
  .usage('<templateName> [options]')
  .description('Creates a page template in a light module.')
  .option('-p, --path <path>', 'The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the page will be tentatively created there.')
  .parse(process.argv)

var args = createPage.validateAndResolveArgs(program)
createPage.create(args)
