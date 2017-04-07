const path = require('path')
const fs = require('fs')
const waterfall = require('async/waterfall')

const createFromPrototype = require('./createFromPrototype')
const helper = require('./helper.js')
const MgnlCliError = helper.MgnlCliError
const configJson = require(helper.resolveMgnlCliJsonPath())
const log = helper.logger
const getModuleName = helper.getModuleName
const stripLastSep = helper.stripLastSep
const createDefinitionTemplatePath = helper.createDefinitionTemplatePath
const i18next = require('./bootstrap.js')()

function createPage (params, cb) {
  const templatePath = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.templates_pages, params.newPageName)
  const templateDefinitionFile = templatePath + '.yaml'
  const templateScriptFile = templatePath + '.ftl'

  const dialogDefinitionFile = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.dialogs_pages, params.newPageName + '.yaml')
  const dialogDefinitionId = params.moduleName + ':' + configJson.lightDevFoldersInModule.dialogs_pages.replace('/dialogs/', '') + '/' + params.newPageName

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
      createFromPrototype.create(
        `/${params.prototypeName}/definition.yaml`,
        templateDefinitionFile,
        {
          '__name__': params.newPageName,
          '__templateScript__': createDefinitionTemplatePath(params.moduleName, configJson.lightDevFoldersInModule.templates_pages, params.newPageName),
          '__dialog__': dialogDefinitionId,
          '__lightDevModuleFolder__': params.moduleName
        },
        cb
      )
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

      createFromPrototype.create(
        `${params.prototypeName}/template.ftl`,
        templateScriptFile, {
          '__name__': params.newPageName,
          '__lightDevModuleFolder__': params.moduleName
        },
        cb
      )
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

      createFromPrototype.create(
        `/${params.prototypeName}/dialog.yaml`,
        dialogDefinitionFile,
        {
          '__name__': params.newPageName,
          '__lightDevModuleFolder__': params.moduleName
        },
        cb
      )
    },

    function (cb) {
      log.info(i18next.t('mgnl-create-page--info-page-template-created'))
      cb(null)
    }

  ], cb)
}

const validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError(i18next.t('mgnl-create-page--error-expected-one-arg'), true)
  }
  const newPageName = program.args[0]
  let moduleName = null
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
  const pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)

  const prototypeName = program.prototype || 'page'

  return {
    pathToLightModule: stripLastSep(pathToModule),
    moduleName: moduleName,
    newPageName: newPageName,
    prototypeName: prototypeName
  }
}

exports.create = createPage
exports.validateAndResolveArgs = validateAndResolveArgs
