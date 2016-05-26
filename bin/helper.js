var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var chalk = require('chalk')
var util = require('util')
var packageJson = require('../package.json')

var printError = function (msg) {
  console.error(chalk.red(msg))
}
var printSuccess = function (msg) {
  console.log(chalk.green('DONE:'), chalk.green(msg))
}
var printInfo = function (msg) {
  console.log('INFO:', msg)
}

/**
 * A custom Error to help command decide whether to display help or not.
 * By default no help is shown.
 */
var MgnlCliError = function (message, displayHelp) {
  Error.call(this)
  this.name = 'ERROR'
  this.message = message
  this.displayHelp = displayHelp || false
}
util.inherits(MgnlCliError, Error)

var ensureIsAValidLightModuleFolder = function (pathToModule) {
  var invalidLightModuleMsg = "Sorry, path '%s' does not seem to point at a valid existing light module folder." +
    '\nPath option should point at a valid light module (e.g. one created with mgnl create-light-module). ' +
    'Please, ensure your light module complies with the expected structure.\nSee https://documentation.magnolia-cms.com/display/DOCS/Modules#Modules-Modulestructure'

  if (!fs.existsSync(pathToModule)) {
    throw new MgnlCliError(util.format('Path %s does not exist. Please fix it or create it first', pathToModule))
  } else {
    var pages = path.join(pathToModule, packageJson.lightDevFoldersInModule.templates_pages)
    var components = path.join(pathToModule, packageJson.lightDevFoldersInModule.templates_components)

    if (!fs.existsSync(pages) || !fs.existsSync(components)) {
      throw new MgnlCliError(util.format(invalidLightModuleMsg, pathToModule))
    }
  }
}

var createFolders = function (lightModulesRoot, moduleName) {
  var folders = [
    lightModulesRoot,
    lightModulesRoot + '/' + moduleName]

  Object.keys(packageJson.lightDevFoldersInModule).forEach(function (key) {
    folders.push(path.join(lightModulesRoot, moduleName, packageJson.lightDevFoldersInModule[key]))
  })

  folders.forEach(function (folder) {
    var normalizedFolder = path.normalize(folder)
    if (!fs.existsSync(normalizedFolder)) {
      if (fse.mkdirpSync(normalizedFolder)) {
        printInfo(util.format("Resource folder '%s' created.", normalizedFolder))
      }
    }
  })
}

/**
* Parses a definition reference string, expected to be in a form of [<module>:][<relative_path>/]<name>[@<area_name>]
*/
function parseDefinitionReference (definitionId, moduleName) {
  var def = {}
  var containsTargetArea = definitionId.indexOf('@') !== -1
  if (containsTargetArea) {
    var idx = definitionId.indexOf('@')
    def.area = definitionId.substring(idx + 1)
    definitionId = definitionId.substring(0, idx)
  }
  var refIdMatcher = /^(?:(\w+):)?([\w\/]+\/)?(\w+)$/.exec(definitionId)
  if (refIdMatcher) {
    // if 'module' is not provided - then use the one passed
    var module = refIdMatcher[1] ? refIdMatcher[1] : moduleName
    // if no slashes occur in the path/name string - assume path to be equal to the name
    var path = refIdMatcher[2] ? refIdMatcher[2] + refIdMatcher[3] : (containsTargetArea ? 'pages/' : 'components/') + refIdMatcher[3]
    def.module = module
    def.path = path
    def.name = refIdMatcher[3]
    def.refId = module + ':' + path
  }
  return def
}

var matchesDefinitionReferenceWithAreaPattern = function (val) {
  return /^([\w\/:]+)@(\w+)$/.exec(val)
}
var matchesDefinitionReferenceWithoutAreaPattern = function (val) {
  return /^([\w\/:]+)$/.exec(val)
}

/**
 * Imports a custom package.json from MGNLCLI_HOME if the latter is set or the default one.
 */
var requirePackageJson = function () {
  // a MGNLCLI_HOME env variable is set, use package.json from there
  if (process.env.MGNLCLI_HOME) {
    printInfo(util.format('MGNLCLI_HOME env variable is set. Using package.json at %s', process.env.MGNLCLI_HOME))
    return require(path.join(process.env.MGNLCLI_HOME, 'package.json'))
  } else {
    return require('../package.json')
  }
}

exports.parseDefinitionReference = parseDefinitionReference
exports.matchesDefinitionReferenceWithAreaPattern = matchesDefinitionReferenceWithAreaPattern
exports.matchesDefinitionReferenceWithoutAreaPattern = matchesDefinitionReferenceWithoutAreaPattern
exports.createFolders = createFolders
exports.MgnlCliError = MgnlCliError
exports.printError = printError
exports.printSuccess = printSuccess
exports.printInfo = printInfo
exports.ensureIsAValidLightModuleFolder = ensureIsAValidLightModuleFolder
exports.requirePackageJson = requirePackageJson
