#!/usr/bin/env node

require('../lib/handleErrors.js')

var program = require('../lib/commander_shimmed.js')
var addAvailability = require('../lib/addAvailability.js')

var packageJson = require('../package.json')

program
  .version(packageJson.version)
  .name('mgnl add-availability')
  .usage('<[module-id:]path-to-component>  <path-to-page[@area]> [options]')
  .description('Makes a component available to a given area of some module. E.g. "mgnl add-availability html myHome@main -p /path/to/my-module" makes component "html" available in my-module at "myHome" page in the "main" area. If no area is specified it defaults to "main"')
  .option('-g, --autogenerate', 'Add this option to provide autogeneration instead of plain availability for a component.')
  .option('-p, --path <path>', 'The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the availability will be tentatively added there.')
  .parse(process.argv)

var args = addAvailability.validateAndResolveArgs(program)
addAvailability.add(args)
