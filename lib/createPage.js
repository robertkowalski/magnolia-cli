var path = require('path')
var fs = require('fs')
var waterfall = require('async/waterfall')

var createFromPrototype = require('./createFromPrototype')
var helper = require('./helper.js')
var MgnlCliError = helper.MgnlCliError
var configJson = require(helper.resolveMgnlCliJsonPath())
var log = helper.logger
var getModuleName = helper.getModuleName
var stripLastSep = helper.stripLastSep
var createDefinitionTemplatePath = helper.createDefinitionTemplatePath
const i18next = require('./bootstrap.js')()

var createPage = function (params, cb) {
  var templatePath = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.templates_pages, params.newPageName)
  var templateDefinitionFile = templatePath + '.yaml'
  var templateScriptFile = templatePath + '.ftl'

  var dialogDefinitionFile = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.dialogs_pages, params.newPageName + '.yaml')
  var dialogDefinitionId = params.moduleName + ':' + configJson.lightDevFoldersInModule.dialogs_pages.replace('/dialogs/', '') + '/' + params.newPageName

  // page definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(
      i18next.t(
        'mgnl-create-page--error-page-already-exists',
        { name: params.newPageName, file: templateDefinitionFile, interpolation: { escapeValue: false } }
      )
    )
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
        log.info(
          i18next.t(
            'mgnl-create-page--info-template-script-already-exists',
            { file: templateScriptFile, interpolation: { escapeValue: false } }
          )
        )
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
        log.info(
          i18next.t(
            'mgnl-create-page--info-dialog-already-exists',
            { file: dialogDefinitionFile, interpolation: { escapeValue: false } }
          )
        )
        return cb(null)
      }

      createFromPrototype.create('/page/dialog.yaml', dialogDefinitionFile, {
        '__name__': params.newPageName,
        '__lightDevModuleFolder__': params.moduleName
      }, cb)
    },

    function (cb) {
      log.info(i18next.t('mgnl-create-page--info-page-template-created'))
      cb(null)
    }

  ], cb)
}

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError(i18next.t('mgnl-create-page--error-expected-one-arg'), true)
  }
  var newPageName = program.args[0]
  var moduleName = null
  if (newPageName.indexOf(path.sep) !== -1) {
    throw new MgnlCliError(
      i18next.t(
        'mgnl-create-page--error-invalid-page-name',
        { name: newPageName, interpolation: { escapeValue: false } }
      ),
      true
    )
  }

  if (program.path) {
    moduleName = getModuleName(program.path)
  } else {
    // assume the current dir is a light module.
    log.info(i18next.t('mgnl-create-page--info-page-no-path'))
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
