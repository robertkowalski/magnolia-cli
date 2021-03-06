const path = require('path')
const fs = require('fs')
const helper = require('./helper')
const MgnlCliError = helper.MgnlCliError
const configJson = require(helper.resolveMgnlCliJsonPath())
const log = helper.logger
const getModuleName = helper.getModuleName
const stripLastSep = helper.stripLastSep
const createDefinitionTemplatePath = helper.createDefinitionTemplatePath

const createFromPrototype = require('./createFromPrototype')
const addAvailability = require('./addAvailability')
const i18next = require('./bootstrap.js')()

function createComponent (args) {
  const templatePath = path.join(args.pathToLightModule, configJson.lightDevFoldersInModule.templates_components, args.component.name)
  const templateDefinitionFile = templatePath + '.yaml'
  const templateScriptFile = templatePath + '.ftl'

  const dialogDefinitionFile = path.join(args.pathToLightModule, configJson.lightDevFoldersInModule.dialogs_components, args.component.name + '.yaml')
  const dialogDefinitionId = args.component.module + ':' + configJson.lightDevFoldersInModule.dialogs_components.replace('/dialogs/', '') + '/' + args.component.name

  // component definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(
      i18next.t(
        'mgnl-create-component--error-component-already-exists',
        { componentName: args.component.name, file: templateDefinitionFile, interpolation: { escapeValue: false } }
      )
    )
  }

  let cb = () => {}
  if (args.available || args.autogenerate) {
    cb = (err) => {
      if (err) throw err
      addAvailability.add(args)
    }
  }

  createFromPrototype.create(`/${args.prototypeName}/definition.yaml`, templateDefinitionFile, {
    '__name__': args.component.name,
    '__lightDevModuleFolder__': args.moduleName,
    '__templateScript__': createDefinitionTemplatePath(args.component.module, configJson.lightDevFoldersInModule.templates_components, args.component.name),
    '__dialog__': dialogDefinitionId
  }, cb)

  // template script
  if (!fs.existsSync(templateScriptFile)) {
    createFromPrototype.create(`/${args.prototypeName}/template.ftl`, templateScriptFile, {
      '__name__': args.component.name,
      '__lightDevModuleFolder__': args.moduleName
    })
  } else {
    log.info(
      i18next.t(
        'mgnl-create-component--info-template-script-already-exists',
        { componentName: args.component.name, file: templateDefinitionFile, interpolation: { escapeValue: false } }
      )
    )
  }

  // dialog
  if (!fs.existsSync(dialogDefinitionFile)) {
    createFromPrototype.create(`/${args.prototypeName}/dialog.yaml`, dialogDefinitionFile, {
      '__name__': args.component.name,
      '__lightDevModuleFolder__': args.moduleName
    })
  } else {
    log.info(
      i18next.t(
        'mgnl-create-component--info-dialog-already-exists',
        { dialogFile: dialogDefinitionFile, interpolation: { escapeValue: false } }
      )
    )
  }

  log.info(i18next.t('mgnl-create-component--info-component-created'))
}

const validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  // aut aut
  if (program.available && program.autogenerate) {
    throw new MgnlCliError(
      i18next.t('mgnl-create-component--error-just-available-or-autogenerate'),
      true
    )
  }
  var args = {}
  let moduleName

  if (program.path) {
    args.path = path.resolve(program.path, '../')
    moduleName = getModuleName(program.path)
  } else {
    // defaults to current dir
    log.info(i18next.t('mgnl-create-component--info-no-path-provided'))

    args.path = path.resolve('..')
    // token after last slash is assumed to be module name
    moduleName = path.basename(process.cwd())
  }
  args.component = helper.parseDefinitionReference(program.args[0], moduleName)

  const pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)
  args.pathToLightModule = stripLastSep(pathToModule)

  if (program.available || program.autogenerate) {
    let page = program.available || program.autogenerate
    // if no area was specified defaults to main
    if (page.indexOf('@') === -1) {
      log.info(i18next.t('mgnl-create-component--info-no-target-area'))
      page = page.concat('@main')
    }
    args.targetPage = helper.parseDefinitionReference(page, moduleName)
    args.targetArea = args.targetPage.area

    args.templateDefinitionFilePath = path.normalize(args.pathToLightModule + '/templates/' + args.targetPage.path + '.yaml')
    if (!fs.existsSync(args.templateDefinitionFilePath)) {
      throw new MgnlCliError(
        i18next.t(
          'mgnl-create-component--error-page-definition-not-exist',
          { file: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
        )
      )
    }
    args.available = program.available
    args.autogenerate = program.autogenerate
  }

  args.prototypeName = program.prototype || 'component'

  args.moduleName = moduleName

  return args
}

exports.create = createComponent
exports.validateAndResolveArgs = validateAndResolveArgs
