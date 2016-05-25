var path = require('path')
var fs = require('fs')
var util = require('util')

var helper = require('./helper')
var MgnlCliError = helper.MgnlCliError
var yaml = require('./yamlHelper')

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 2) {
    throw new MgnlCliError('Expected two arguments', true)
  }
  var arg = program.args[1]
  if (!helper.matchesDefinitionReferenceWithAreaPattern(arg) && !helper.matchesDefinitionReferenceWithoutAreaPattern(arg)) {
    throw util.format('Expected a value in the form e.g. [myModule:pages/]myHome@someArea but was %s', arg)
  }

  var args = {}
  var moduleName

  if (program.path) {
    // token after last slash is assumed to be module name
    var splitPath = program.path.split(path.sep).filter(Boolean)
    if (splitPath.length === 1) {
      // assume parent is light module root
      args.path = path.join('../', splitPath[0])
      moduleName = splitPath[0]
    } else {
      args.path = path.resolve(program.path, '../')
      // assume last part is module name
      moduleName = splitPath[splitPath.length - 1]
    }
  } else {
    // defaults to current dir
    var cwd = process.cwd()
    args.path = cwd.substring(0, cwd.lastIndexOf('/'))
    // token after last slash is assumed to be module name
    moduleName = path.basename(cwd)
  }

  args.component = helper.parseDefinitionReference(program.args[0], moduleName)

  args.targetPage = helper.parseDefinitionReference(arg, moduleName)
  args.targetArea = args.targetPage.area

  if (typeof args.targetArea === 'undefined') {
    throw util.format('Could not resolve area for %s', args.targetArea)
  }
  var pathToModule = program.path || process.cwd()
  helper.ensureIsAValidLightModuleFolder(pathToModule)

  args.templateDefinitionFilePath = path.normalize(pathToModule + '/templates/' + args.targetPage.path + '.yaml')
  if (!fs.existsSync(args.templateDefinitionFilePath)) {
    throw util.format("%s page definition doesn't exist", args.templateDefinitionFilePath)
  }
  // by default available option is set, else it must be autogenerate.
  args.available = !program.autogenerate

  return args
}

function addAvailability (args) {
  fs.readFile(args.templateDefinitionFilePath, 'utf-8', function (err, data) {
    if (err) throw err
    modifyYamlConfiguration(yaml.create(data), args)
  })
}

function modifyYamlConfiguration (yaml, args) {
  if (!yaml.hasNode('/areas/' + args.targetArea)) {
    var templateScriptPath = path.join(args.path, yaml.getScalarValue('/templateScript'))
    fs.appendFile(templateScriptPath, '\n\n[@cms.area name="' + args.targetArea + '"/]', rethrowOnError)
    helper.printSuccess(util.format('Created new area %s at the end of %s', args.targetArea, templateScriptPath))
  }

  if (args.available ? injectComponentAvailability(yaml, args) : injectAutoGeneration(yaml, args)) {
    fs.writeFile(args.templateDefinitionFilePath, yaml.dump(), 'utf-8', function (err) {
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
    helper.printSuccess(util.format('Availability for %s added into %s', args.component.refId, args.templateDefinitionFilePath))
    return true
  } else {
    console.log('Component %s is already available at %s', args.component.refId, args.templateDefinitionFilePath)
  }
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
    helper.printSuccess(util.format('Autogeneration for %s added into %s', args.component.refId, args.templateDefinitionFilePath))
    return true
  } else {
    console.log('Component %s is already configured for autogeneration at %s', args.component.refId, args.templateDefinitionFilePath)
  }
  return false
}

function rethrowOnError (err) {
  if (err) throw err
}

exports.add = addAvailability
exports.validateAndResolveArgs = validateAndResolveArgs
