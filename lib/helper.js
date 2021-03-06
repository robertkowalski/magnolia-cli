const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const findup = require('findup-sync')
const log = require('npmlog')
const chalk = require('chalk')
const i18next = require('./bootstrap.js')()
const ini = require('ini')
const pkg = require('../package.json')
const os = require('os')

function getEnv () {
  return `mgnl: ${pkg.version} node: ${process.version} os: ${os.platform()}`
}

const resolveMgnlCliJsonPath = function () {
  const mgnlCliJson = findup('mgnl-cli.json')
  if (mgnlCliJson) {
    return mgnlCliJson
  } else {
    // npm global location for mgnl-cli.json
    return path.resolve(__dirname, '../lib/config/mgnl-cli.json')
  }
}

const resolveMgnlCliPrototypesPath = function () {
  const mgnlCliJson = findup('mgnl-cli.json')
  if (mgnlCliJson) {
    return path.join(path.resolve(mgnlCliJson, '..'), 'mgnl-cli-prototypes')
  } else {
    // npm global location for prototypes
    return path.resolve(__dirname, '../lib/config/mgnl-cli-prototypes')
  }
}

function findTomcat (p) {
  if (p) {
    return findup('apache-tomcat*', {cwd: p})
  }

  return findup('apache-tomcat*')
}

function getLightModulesFolderFromTomcatLocation (p) {
  const apacheTomcatFolder = findTomcat(p)

  if (!apacheTomcatFolder) {
    return false
  }

  const propFile = getMagnoliaPropertiesLocation(apacheTomcatFolder, 'magnoliaAuthor')
  if (!fs.existsSync(propFile)) {
    log.error(i18next.t(
    'helper--is-valid-light-module-folder--error-invalid-path',
    { path: propFile, interpolation: { escapeValue: false } }
  ))
    return false
  }
  const config = ini.parse(fs.readFileSync(propFile, 'utf-8'))

  return path.resolve(propFile, config['magnolia.resources.dir'])
}

function getMagnoliaPropertiesLocation (tomcatFolder, instance) {
  return path.join(
    tomcatFolder,
    'webapps',
    instance,
    'WEB-INF',
    'config',
    'default',
    'magnolia.properties'
  )
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

const ensureIsAValidLightModuleFolder = function (pathToModule) {
  if (!fs.existsSync(pathToModule)) {
    const errMsg = i18next.t(
      'helper--is-valid-light-module-folder--error-invalid-path',
      { path: pathToModule, interpolation: { escapeValue: false } }
    )

    throw new MgnlCliError(errMsg)
  }

  const configJson = require(resolveMgnlCliJsonPath())
  const pages = path.join(pathToModule, configJson.lightDevFoldersInModule.templates_pages)
  const components = path.join(pathToModule, configJson.lightDevFoldersInModule.templates_components)

  if (!fs.existsSync(pages) || !fs.existsSync(components)) {
    const errMsg = i18next.t(
      'helper--is-valid-light-module-folder--error-invalid-light-module-folder',
      { path: pathToModule, interpolation: { escapeValue: false } }
    )

    throw new MgnlCliError(errMsg)
  }
}

const createFolders = function (lightModulesRoot, moduleName) {
  const folders = [
    lightModulesRoot,
    lightModulesRoot + '/' + moduleName
  ]

  const configJson = require(resolveMgnlCliJsonPath())

  Object.keys(configJson.lightDevFoldersInModule).forEach((key) => {
    folders.push(path.join(lightModulesRoot, moduleName, configJson.lightDevFoldersInModule[key]))
  })

  folders.forEach((folder) => {
    const normalizedFolder = path.normalize(folder)
    if (!fs.existsSync(normalizedFolder)) {
      if (fs.mkdirpSync(normalizedFolder)) {
        logger.info(
          i18next.t(
            'helper--create-folders--info-folder-created',
            { folder: normalizedFolder, interpolation: { escapeValue: false } }
          )
        )
      }
    }
  })
}

/**
* Parses a definition reference string, expected to be in a form of [<module>:][<relative_path>/]<name>[@<area_name>]
*/
function parseDefinitionReference (definitionId, moduleName) {
  const def = {}
  const containsTargetArea = definitionId.indexOf('@') !== -1
  if (containsTargetArea) {
    const idx = definitionId.indexOf('@')
    def.area = definitionId.substring(idx + 1)
    definitionId = definitionId.substring(0, idx)
  }
  const refIdMatcher = /^(?:([\w-]+):)?([\w-\/]+\/)?([\w-]+)$/.exec(definitionId)
  if (!refIdMatcher) {
    const errMsg = i18next.t(
      'helper--parse-definition-reference--error-no-match-id',
      { id: definitionId, interpolation: { escapeValue: false } }
    )

    throw new MgnlCliError(errMsg)
  }

  // if 'module' is not provided - then use the one passed
  const module = refIdMatcher[1] ? refIdMatcher[1] : moduleName
  // if no slashes occur in the path/name string - assume path to be equal to the name
  const path = refIdMatcher[2] ? refIdMatcher[2] + refIdMatcher[3] : (containsTargetArea ? 'pages/' : 'components/') + refIdMatcher[3]
  def.module = module
  def.path = path
  def.name = refIdMatcher[3]
  def.refId = module + ':' + path

  return def
}

const matchesDefinitionReferenceWithAreaPattern = function (val) {
  return /^([\w-\/:]+)@([\w-]+)$/.exec(val)
}
const matchesDefinitionReferenceWithoutAreaPattern = function (val) {
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
    const errMsg = i18next.t('helper--create-definition-template-path--error-no-args')
    throw new MgnlCliError(errMsg)
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
  }

  return pathToSplit.split('/').filter(Boolean)
}

function getModuleName (pathToModule) {
  const splitPath = split(pathToModule)
  if (splitPath.length === 1) {
    // token after last slash is assumed to be module name
    return splitPath[0]
  }

  // assume last part is module name
  return splitPath[splitPath.length - 1]
}

exports.getEnv = getEnv
exports.getLightModulesFolderFromTomcatLocation = getLightModulesFolderFromTomcatLocation
exports.getMagnoliaPropertiesLocation = getMagnoliaPropertiesLocation
exports.findTomcat = findTomcat
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
