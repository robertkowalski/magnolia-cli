const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const findup = require('findup-sync')
const log = require('npmlog')
const chalk = require('chalk')

var resolveMgnlCliJsonPath = function () {
  var mgnlCliJson = findup('mgnl-cli.json')
  if (mgnlCliJson) {
    return mgnlCliJson
  } else {
    // npm global location for mgnl-cli.json
    return path.resolve(__dirname, '../lib/config/mgnl-cli.json')
  }
}

var resolveMgnlCliPrototypesPath = function () {
  var mgnlCliJson = findup('mgnl-cli.json')
  if (mgnlCliJson) {
    return path.join(path.resolve(mgnlCliJson, '..'), 'mgnl-cli-prototypes')
  } else {
    // npm global location for prototypes
    return path.resolve(__dirname, '../lib/config/mgnl-cli-prototypes')
  }
}

/**
 * Wraps npmlog package so that stderr is used only for errors, whereas info and other levels use stdout.
 * Offers an additional level 'important'. Also colors message text.
 * @type {Object}
 */
const logger = {

  silly (message, ...args) {
    log.stream = process.stderr
    log.silly('', message, ...args)
  },

  error: function (message, ...args) {
    log.stream = process.stderr
    args.length > 0 ? log.error('', chalk.red(message), ...args) : log.error('', chalk.red(message))
  },

  info: function (message, ...args) {
    log.stream = process.stdout
    args.length > 0 ? log.info('', message, ...args) : log.info('', message)
  },

  important: function (message, ...args) {
    log.stream = process.stdout
    args.length > 0 ? log.info('', chalk.yellow(message), ...args) : log.info('', chalk.yellow(message))
  }
}

/**
 * A custom Error to help command decide whether to display help or not.
 * By default no help is shown.
 */
function MgnlCliError (message, displayHelp) {
  if (!(this instanceof MgnlCliError)) {
    return new MgnlCliError(message, displayHelp)
  }
  log.stream = process.stderr
  Error.call(this)
  this.name = 'ERROR'
  this.message = chalk.red(message)
  this.displayHelp = displayHelp || false
}
util.inherits(MgnlCliError, Error)

var ensureIsAValidLightModuleFolder = function (pathToModule) {
  var invalidLightModuleMsg = "Sorry, path '%s' does not seem to point at a valid existing light module folder." +
    '\nPath option should point at a valid light module (e.g. one created with mgnl create-light-module). ' +
    'Please, ensure your light module complies with the expected structure.\nSee https://documentation.magnolia-cms.com/display/DOCS/Magnolia+CLI#MagnoliaCLI-Lightmoduleminimalfolderstructure'

  if (!fs.existsSync(pathToModule)) {
    throw new MgnlCliError(util.format('Path %s does not exist. Please fix it or create it first', pathToModule))
  } else {
    var configJson = require(resolveMgnlCliJsonPath())
    var pages = path.join(pathToModule, configJson.lightDevFoldersInModule.templates_pages)
    var components = path.join(pathToModule, configJson.lightDevFoldersInModule.templates_components)

    if (!fs.existsSync(pages) || !fs.existsSync(components)) {
      throw new MgnlCliError(util.format(invalidLightModuleMsg, pathToModule))
    }
  }
}

var createFolders = function (lightModulesRoot, moduleName) {
  var folders = [
    lightModulesRoot,
    lightModulesRoot + '/' + moduleName]
  var configJson = require(resolveMgnlCliJsonPath())
  Object.keys(configJson.lightDevFoldersInModule).forEach(function (key) {
    folders.push(path.join(lightModulesRoot, moduleName, configJson.lightDevFoldersInModule[key]))
  })

  folders.forEach(function (folder) {
    var normalizedFolder = path.normalize(folder)
    if (!fs.existsSync(normalizedFolder)) {
      if (fs.mkdirpSync(normalizedFolder)) {
        logger.info("Resource folder '%s' created.", normalizedFolder)
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
  var refIdMatcher = /^(?:([\w-]+):)?([\w-\/]+\/)?([\w-]+)$/.exec(definitionId)
  if (refIdMatcher) {
    // if 'module' is not provided - then use the one passed
    var module = refIdMatcher[1] ? refIdMatcher[1] : moduleName
    // if no slashes occur in the path/name string - assume path to be equal to the name
    var path = refIdMatcher[2] ? refIdMatcher[2] + refIdMatcher[3] : (containsTargetArea ? 'pages/' : 'components/') + refIdMatcher[3]
    def.module = module
    def.path = path
    def.name = refIdMatcher[3]
    def.refId = module + ':' + path
  } else {
    throw new Error(util.format("%s doesn't match definitionId pattern", definitionId))
  }
  return def
}

var matchesDefinitionReferenceWithAreaPattern = function (val) {
  return /^([\w-\/:]+)@([\w-]+)$/.exec(val)
}
var matchesDefinitionReferenceWithoutAreaPattern = function (val) {
  return /^([\w-\/:]+)$/.exec(val)
}

/**
 * Strips the last separator from a path in a OS agnostic way. On Windows, depending on the shell
 * used (native cmd or something more *nix-like) the separator could either be slash or backslash.
 * @return {String}
 */
function stripLastSep (pathToStrip) {
  if (pathToStrip.endsWith(path.sep) || pathToStrip.endsWith('/')) {
    return pathToStrip.slice(0, -1)
  }
  return pathToStrip
}

/**
 * Creates the path to the template script as expected by a definition file. Regardless
 * of whether we're on Windows or *nix the path must use slash not backslash
 * @return {String}
 */
function createDefinitionTemplatePath (...args) {
  if (args.length === 0) {
    throw new MgnlCliError('Expected args not to be empty')
  }
  // the regex removes slashes in excess
  return ('/' + args.join('/')).replace(/\/\/+/g, '/') + '.ftl'
}

/**
 * Splits a path in a OS agnostic way. On Windows, depending on the shell
 * used (native cmd or something more *nix-like) the separator could either be slash or backslash.
 * @return {Array} of elements only (no separator)
 */
function split (pathToSplit) {
  if (pathToSplit.indexOf(path.sep) !== -1) {
    // clever trick with filter to get rid of unwanted separators found on http://stackoverflow.com/a/19888749, of course
    return pathToSplit.split(path.sep).filter(Boolean)
  } else {
    return pathToSplit.split('/').filter(Boolean)
  }
}

function getModuleName (pathToModule) {
  var splitPath = split(pathToModule)
  if (splitPath.length === 1) {
    // token after last slash is assumed to be module name
    return splitPath[0]
  } else {
    // assume last part is module name
    return splitPath[splitPath.length - 1]
  }
}

exports.parseDefinitionReference = parseDefinitionReference
exports.matchesDefinitionReferenceWithAreaPattern = matchesDefinitionReferenceWithAreaPattern
exports.matchesDefinitionReferenceWithoutAreaPattern = matchesDefinitionReferenceWithoutAreaPattern
exports.createFolders = createFolders
exports.MgnlCliError = MgnlCliError
exports.logger = logger
exports.ensureIsAValidLightModuleFolder = ensureIsAValidLightModuleFolder
exports.resolveMgnlCliJsonPath = resolveMgnlCliJsonPath
exports.resolveMgnlCliPrototypesPath = resolveMgnlCliPrototypesPath
exports.defaultLightModulesRootName = 'light-modules'
exports.stripLastSep = stripLastSep
exports.createDefinitionTemplatePath = createDefinitionTemplatePath
exports.getModuleName = getModuleName
