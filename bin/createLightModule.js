var path = require('path')
var fs = require('fs')
var util = require('util')

var helper = require('./helper')
var MgnlCliError = helper.MgnlCliError
var copyResources = require('./copyResources.js')

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  var lightModulesRoot

  if (program.path) {
    lightModulesRoot = program.path
    var absPath = path.resolve(process.cwd(), './' + lightModulesRoot)
    if (!fs.existsSync(absPath)) {
      throw util.format('Path %s does not exist. Please fix it or create it first', absPath)
    }
  } else {
    console.log('No path option provided, light module will be created in the current folder.')
    lightModulesRoot = process.cwd()
  }
  var moduleName = program.args[0]

  if (fs.existsSync(path.join(lightModulesRoot, moduleName))) {
    throw new MgnlCliError(util.format('Module %s already exists at %s', moduleName, lightModulesRoot))
  }

  return {
    'lightModulesRoot': lightModulesRoot,
    'moduleName': moduleName
  }
}

var createLightModule = function (args) {
  helper.createFolders(args.lightModulesRoot, args.moduleName)
  copyResources.copyLightDevResources(args.lightModulesRoot, args.moduleName)
  helper.printSuccess(util.format('Module %s created at %s', args.moduleName, args.lightModulesRoot))
}

exports.create = createLightModule
exports.validateAndResolveArgs = validateAndResolveArgs
