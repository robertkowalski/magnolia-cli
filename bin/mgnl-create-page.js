var program = require('commander')

var helper = require('./helper')
var createPage = require('./createPage.js')
var packageJson = require('../package.json')

program
  .version(packageJson.version)
  .usage('<templateName> [options]')
  .description('Creates a page template in a light module.')
  .option('-p, --path <path>', 'The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the page will be tentatively created there.')
  .parse(process.argv)

try {
  var args = createPage.validateAndResolveArgs(program)
  createPage.create(args)
} catch (e) {
  helper.printError(e)
  if (e.displayHelp) {
    program.outputHelp()
  }
}
