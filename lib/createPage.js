var path = require('path')
var fs = require('fs')
var util = require('util')
var waterfall = require('async/waterfall')

var createFromPrototype = require('./createFromPrototype')
var helper = require('./helper.js')
var MgnlCliError = helper.MgnlCliError
var configJson = require(helper.resolveMgnlCliJsonPath())
var log = helper.logger
var getModuleName = helper.getModuleName
var stripLastSep = helper.stripLastSep
var createDefinitionTemplatePath = helper.createDefinitionTemplatePath

var createPage = function (params, cb) {
  var templatePath = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.templates_pages, params.newPageName)
  var templateDefinitionFile = templatePath + '.yaml'
  var templateScriptFile = templatePath + '.ftl'

  var dialogDefinitionFile = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.dialogs_pages, params.newPageName + '.yaml')
  var dialogDefinitionId = params.moduleName + ':' + configJson.lightDevFoldersInModule.dialogs_pages.replace('/dialogs/', '') + '/' + params.newPageName

  // page definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(util.format("'%s' page template already exists at %s", params.newPageName, templateDefinitionFile))
  }

  waterfall([
    function (cb) {
      createFromPrototype.create('/page/definition.yaml', templateDefinitionFile, {
        '__name__': params.newPageName,
        '__templateScript__': createDefinitionTemplatePath(params.moduleName, configJson.lightDevFoldersInModule.templates_pages, params.newPageName),
        '__dialog__': dialogDefinitionId,
        '__lightDevModuleFolder__': params.moduleName
      }, cb)
    },

    function (cb) {
      // template script
      if (fs.existsSync(templateScriptFile)) {
        log.info("'%s' templateScript already exists", templateScriptFile)
        return cb(null)
      }

      createFromPrototype.create('/page/template.ftl', templateScriptFile, {
        '__name__': params.newPageName,
        '__lightDevModuleFolder__': params.moduleName
      }, cb)
    },

    function (cb) {
      // dialog
      if (fs.existsSync(dialogDefinitionFile)) {
        log.info("'%s' dialog already exists", dialogDefinitionFile)
        return cb(null)
      }

      createFromPrototype.create('/page/dialog.yaml', dialogDefinitionFile, {
        '__name__': params.newPageName,
        '__lightDevModuleFolder__': params.moduleName
      }, cb)
    },

    function (cb) {
      log.info('Page template created')
      cb(null)
    }

  ], cb)
}

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  var newPageName = program.args[0]
  var moduleName = null
  if (newPageName.indexOf(path.sep) !== -1) {
    throw new MgnlCliError(util.format('%s is not valid page name. It should contain no slash character', newPageName), true)
  }

  if (program.path) {
    moduleName = getModuleName(program.path)
  } else {
    // assume the current dir is a light module.
    log.info('No path option provided, page template will be created in the current folder.')
    moduleName = path.basename(process.cwd())
  }
  var pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)

  return {
    'pathToLightModule': stripLastSep(pathToModule),
    'moduleName': moduleName,
    'newPageName': newPageName
  }
}

exports.create = createPage
exports.validateAndResolveArgs = validateAndResolveArgs
