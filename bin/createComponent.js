var path = require('path')
var fs = require('fs')
var util = require('util')
var async = require('async')
var helper = require('./helper')
var MgnlCliError = helper.MgnlCliError

var createFromPrototype = require('./createFromPrototype')
var addAvailability = require('./addAvailability')

var packageJson = require('../package.json')

var createComponent = function (args) {
  var templatePath = path.join(args.pathToLightModule, packageJson.lightDevFoldersInModule.templates_components, args.component.name)
  var templateDefinitionFile = templatePath + '.yaml'
  var templateScriptFile = templatePath + '.ftl'

  var dialogDefinitionFile = path.join(args.pathToLightModule, packageJson.lightDevFoldersInModule.dialogs_components, args.component.name + '.yaml')
  var dialogDefinitionId = args.component.module + ':' + packageJson.lightDevFoldersInModule.dialogs_components.replace('/dialogs/', '') + '/' + args.component.name

  // component definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(util.format('%s component template already exists at %s', args.component.name, templateDefinitionFile))
  } else {
    createFromPrototype.createFromPrototype('/component/definition.yaml', templateDefinitionFile, {
      '__name__': args.component.name,
      '__templateScript__': templateScriptFile.replace(args.pathToLightModule, '/' + args.component.module),
      '__dialog__': dialogDefinitionId
    })

    if (args.available || args.autogenerate) {
      // wait until definition file has been created
      async.until(
        // test function which will be regularly invoked until true
        function () {
          return fs.existsSync(templateDefinitionFile)
        },
        // Once the condition is true, that is the definition has been created
        // the callback function can be invoked
        function (callback) {
          setTimeout(function () {
            callback(null)
          }, 100)
        },
        // callback function
        function (err) {
          if (err) throw err
          addAvailability.add(args)
        }
      )
    }
  }

  // template script
  if (!fs.existsSync(templateScriptFile)) {
    createFromPrototype.createFromPrototype('/component/template.ftl', templateScriptFile, {
      '__name__': args.component.name
    })
  } else {
    helper.printInfo(util.format('%s template script already exists at [%s]', args.component.name, templateScriptFile))
  }

  // dialog
  if (!fs.existsSync(dialogDefinitionFile)) {
    createFromPrototype.createFromPrototype('/component/dialog.yaml', dialogDefinitionFile, {
      '__name__': args.component.name
    })
  } else {
    helper.printInfo(util.format('%s dialog already exists', dialogDefinitionFile))
  }
  helper.printSuccess('Component created')
}

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  // aut aut
  if (program.available && program.autogenerate) {
    throw new MgnlCliError('Only one of --available or --autogenerate option can be specified', true)
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
    helper.printInfo(util.format('No path option provided, component will be created in the current folder.'))
    var cwd = process.cwd()
    args.path = cwd.substring(0, cwd.lastIndexOf('/'))
    // token after last slash is assumed to be module name
    moduleName = path.basename(cwd)
  }
  args.component = helper.parseDefinitionReference(program.args[0], moduleName)

  var pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)
  args.pathToLightModule = pathToModule.endsWith(path.sep) ? pathToModule.slice(0, -1) : pathToModule

  if (program.available || program.autogenerate) {
    var ref = program.available || program.autogenerate
    args.targetPage = helper.parseDefinitionReference(ref, moduleName)
    args.targetArea = args.targetPage.area
    if (typeof args.targetArea === 'undefined') {
      args.targetArea = 'main'
    }
    args.templateDefinitionFilePath = path.normalize(args.pathToLightModule + '/templates/' + args.targetPage.path + '.yaml')
    if (!fs.existsSync(args.templateDefinitionFilePath)) {
      throw new MgnlCliError(util.format("%s page definition doesn't exist", args.templateDefinitionFilePath))
    }
    args.available = program.available
    args.autogenerate = program.autogenerate
  }

  return args
}

exports.create = createComponent
exports.validateAndResolveArgs = validateAndResolveArgs
