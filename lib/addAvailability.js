var path = require('path')
var fs = require('fs')

var helper = require('./helper')
var MgnlCliError = helper.MgnlCliError
var yaml = require('./yamlHelper')
var log = helper.logger
var getModuleName = helper.getModuleName

const i18next = require('./bootstrap.js')()

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 2) {
    throw new MgnlCliError(i18next.t('mgnl-add-availability--error-expected-two-args'), true)
  }
  var component = program.args[0]
  var page = program.args[1]
  if (!helper.matchesDefinitionReferenceWithAreaPattern(page) && !helper.matchesDefinitionReferenceWithoutAreaPattern(page)) {
    throw new MgnlCliError(
      i18next.t('mgnl-add-availability--error-unexpected-page-format', { page: page, interpolation: { escapeValue: false } })
    )
  }
  // if no area was specified defaults to main
  if (page.indexOf('@') === -1) {
    log.info(i18next.t('mgnl-add-availability--info-no-target-defined'))
    page = page.concat('@main')
  }

  var args = {}
  var moduleName

  if (program.path) {
    args.path = path.resolve(program.path, '../')
    moduleName = getModuleName(program.path)
  } else {
    args.path = path.resolve('..')
    // token after last slash is assumed to be module name
    moduleName = path.basename(process.cwd())
  }

  args.component = helper.parseDefinitionReference(component, moduleName)

  args.targetPage = helper.parseDefinitionReference(page, moduleName)
  args.targetArea = args.targetPage.area

  var pathToModule = program.path || process.cwd()
  helper.ensureIsAValidLightModuleFolder(pathToModule)

  args.templateDefinitionFilePath = path.normalize(pathToModule + '/templates/' + args.targetPage.path + '.yaml')
  if (!fs.existsSync(args.templateDefinitionFilePath)) {
    throw new MgnlCliError(
      i18next.t(
        'mgnl-add-availability--error-page-definition-doesnt-exist',
        { file: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
      )
    )
  }
  // by default available option is set, else it must be autogenerate.
  args.available = !program.autogenerate

  return args
}

function addAvailability (args) {
  fs.readFile(args.templateDefinitionFilePath, 'utf-8', (err, data) => {
    if (err) throw err
    var yamlData = yaml.create(data)
    if (yamlData.originalYaml.length === 0) {
      const errMsg = i18next.t(
        'mgnl-add-availability--error-empty-definition',
        { filename: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
      )
      throw new MgnlCliError(
        errMsg,
        true
      )
    }
    modifyYamlConfiguration(yamlData, args)
  })
}

function modifyYamlConfiguration (yaml, args) {
  if (!yaml.hasNode('/areas/' + args.targetArea)) {
    var templateScriptPath = path.join(args.path, yaml.getScalarValue('/templateScript'))
    fs.appendFile(templateScriptPath, '\n\n[@cms.area name="' + args.targetArea + '"/]', rethrowOnError)
    log.info(
      i18next.t(
        'mgnl-add-availability--info-created-area',
        { targetArea: args.targetArea, templateScript: templateScriptPath, interpolation: { escapeValue: false } }
      )
    )
  }

  if (args.available ? injectComponentAvailability(yaml, args) : injectAutoGeneration(yaml, args)) {
    fs.writeFile(args.templateDefinitionFilePath, yaml.dump(), 'utf-8', (err) => {
      if (err) {
        throw err
      }
    })
  }
}

function injectComponentAvailability (yamlHelper, args) {
  var availableComponentsPath = '/areas/' + args.targetArea + '/availableComponents'

  if (!yamlHelper.hasNode(availableComponentsPath + '/' + args.component.name)) {
    var componentAvailability = {}
    componentAvailability[args.component.name] = {id: args.component.refId}

    yamlHelper.injectSnippetAt(componentAvailability, availableComponentsPath)
    log.info(
      i18next.t(
        'mgnl-add-availability--info-availability-added-into',
        { refId: args.component.refId, file: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
      )
    )
    return true
  }

  log.info(
    i18next.t(
      'mgnl-add-availability--info-component-already-available',
      { refId: args.component.refId, file: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
    )
  )

  return false
}

function injectAutoGeneration (yamlHelper, args) {
  var areaAutoGenerationPath = '/areas/' + args.targetArea + '/autoGeneration'
  if (!yamlHelper.hasNode(areaAutoGenerationPath)) {
    var autoGeneration = {
      generatorClass: 'info.magnolia.rendering.generator.CopyGenerator',
      content: {}
    }

    autoGeneration.content[args.component.name] = {
      nodeType: 'mgnl:component',
      templateId: args.component.refId
    }

    yamlHelper.injectSnippetAt(autoGeneration, areaAutoGenerationPath)
    log.info(
      i18next.t(
        'mgnl-add-availability--info-autogeneration-added',
        { refId: args.component.refId, file: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
      )
    )
    return true
  }

  log.info(
    i18next.t(
      'mgnl-add-availability--info-component-already-configured-for-autogeneration',
      { refId: args.component.refId, file: args.templateDefinitionFilePath, interpolation: { escapeValue: false } }
    )
  )

  return false
}

function rethrowOnError (err) {
  if (err) throw err
}

exports.add = addAvailability
exports.validateAndResolveArgs = validateAndResolveArgs
