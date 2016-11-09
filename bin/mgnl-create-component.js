var program = require('commander')
var createComponent = require('../lib/createComponent.js')
var helper = require('../lib/helper')

var packageJson = require('../package.json')

var matchesPattern = function (val) {
  if (helper.matchesDefinitionReferenceWithAreaPattern(val) || helper.matchesDefinitionReferenceWithoutAreaPattern(val)) {
    return val
  }
  console.error('Expected a value in the form e.g. <path-to-page@area> but was %s', val)
  return false
}

program
  .version(packageJson.version)
  .usage('<name> [options]')
  .description('Creates a component. Optionally makes it available (or autogenerate) to a given area of a page of the current module (or the module defined by the -p option). E.g. mgnl create-component foo --available myHome@main -p /path/to/module')
  .option('-a, --available <path-to-page@area>', 'The target page and area to make the component available.', matchesPattern)
  .option('-g, --autogenerate <path-to-page@area>', 'The target page and area to have the autogenerate component.', matchesPattern)
  .option('-p, --path <path>', 'The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the component will be tentatively created there.')
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
