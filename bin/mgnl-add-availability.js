var program = require('commander')
var addAvailability = require('./addAvailability.js')
var helper = require('./helper')

var packageJson = require('../package.json')

program
  .version(packageJson.version)
  .usage('<[refId/]componentName> <[moduleName:relPath/]page@area> [options]')
  .description("Makes a component available to a given area of some module. E.g. 'mgnl add-availability html myHome@main -p /path/to/my-module' makes component 'html' available in my-module at 'myHome' page in the 'main' area")
  .option('-g, --autogenerate', 'Add this option to provide autogeneration instead of plain availability for a component')
  .option('-p, --path <path>', 'The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the availability will be tentatively added there')
  .parse(process.argv)

try {
  var args = addAvailability.validateAndResolveArgs(program)
  addAvailability.add(args)
} catch (e) {
  helper.printError(e)
  if (e.displayHelp) {
    program.outputHelp()
  }
}
