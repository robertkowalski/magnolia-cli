var program = require('commander')
var createComponent = require('./createComponent.js')
var helper = require('./helper')

var packageJson = require('../package.json')

var matchesPattern = function (val) {
  if (helper.matchesDefinitionReferenceWithAreaPattern(val)) {
    return val
  }
  console.error('Expected a value in the form e.g. [pages/]myHome@someArea but was %s', val)
  return false
}

program
  .version(packageJson.version)
  .usage('<name> [options]')
  .description('Creates a component and optionally makes it available (or autogenerate) to a given area of some module. E.g. mgnl create-component foo --available myHome@main -p /path/to/module')
  .option('-a, --available <[moduleName:relPath/]page@area>', 'Area in target page', matchesPattern)
  .option('-g, --autogenerate <[moduleName:relPath/]page@area>', 'Area in target page', matchesPattern)
  .option('-p, --path <path>', 'The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the component will be tentatively created there')
  .parse(process.argv)

try {
  var args = createComponent.validateAndResolveArgs(program)
  createComponent.create(args)
} catch (e) {
  helper.printError(e)
  if (e.displayHelp) {
    program.outputHelp()
  }
}
