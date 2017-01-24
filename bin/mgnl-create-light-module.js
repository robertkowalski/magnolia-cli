var program = require('commander')
var helper = require('../lib/helper')
var createLightModule = require('../lib/createLightModule.js')

var packageJson = require('../package.json')

program
  .version(packageJson.version)
  .usage('<moduleName> [options]')
  .description('Creates a light module. Light modules are created under a "root" folder which is observed by Magnolia for changes. The path to such folder is the value of "magnolia.resources.dir" property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.')
  .option('-p, --path <path>', 'The path to the light modules root folder. If no path is provided, then the current directory is assumed to be the light modules root folder and the module will be created here.')
  .parse(process.argv)

try {
  var args = createLightModule.validateAndResolveArgs(program)
  createLightModule.create(args, function (err) {
    if (err) throw err
  })
} catch (e) {
  helper.printError(e)
  if (e.displayHelp) {
    program.outputHelp()
  }
}
