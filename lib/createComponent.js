var path = require('path')
var fs = require('fs')
var util = require('util')
var async = require('async')
var helper = require('./helper')
var MgnlCliError = helper.MgnlCliError
var configJson = require(helper.resolveMgnlCliJsonPath())
var log = helper.logger
var getModuleName = helper.getModuleName
var stripLastSep = helper.stripLastSep
var createDefinitionTemplatePath = helper.createDefinitionTemplatePath

var createFromPrototype = require('./createFromPrototype')
var addAvailability = require('./addAvailability')

var createComponent = function (args) {
  var templatePath = path.join(args.pathToLightModule, configJson.lightDevFoldersInModule.templates_components, args.component.name)
  var templateDefinitionFile = templatePath + '.yaml'
  var templateScriptFile = templatePath + '.ftl'

  var dialogDefinitionFile = path.join(args.pathToLightModule, configJson.lightDevFoldersInModule.dialogs_components, args.component.name + '.yaml')
  var dialogDefinitionId = args.component.module + ':' + configJson.lightDevFoldersInModule.dialogs_components.replace('/dialogs/', '') + '/' + args.component.name

  // component definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(util.format('%s component template already exists at %s', args.component.name, templateDefinitionFile))
  } else {
    createFromPrototype.create('/component/definition.yaml', templateDefinitionFile, {
      '__name__': args.component.name,
      '__lightDevModuleFolder__': args.moduleName,
      '__templateScript__': createDefinitionTemplatePath(args.component.module, configJson.lightDevFoldersInModule.templates_components, args.component.name),
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
    createFromPrototype.create('/component/template.ftl', templateScriptFile, {
      '__name__': args.component.name,
      '__lightDevModuleFolder__': args.moduleName
    })
  } else {
    log.info('%s template script already exists at [%s]', args.component.name, templateScriptFile)
  }

  // dialog
  if (!fs.existsSync(dialogDefinitionFile)) {
    createFromPrototype.create('/component/dialog.yaml', dialogDefinitionFile, {
      '__name__': args.component.name,
      '__lightDevModuleFolder__': args.moduleName
    })
  } else {
    log.info('%s dialog already exists', dialogDefinitionFile)
  }
  log.info('Component created')
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
    args.path = path.resolve(program.path, '../')
    moduleName = getModuleName(program.path)
  } else {
    // defaults to current dir
    log.info('No path option provided, component will be created relative to the current folder.')
    args.path = path.resolve('..')
    // token after last slash is assumed to be module name
    moduleName = path.basename(process.cwd())
  }
  args.component = helper.parseDefinitionReference(program.args[0], moduleName)

  var pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)
  args.pathToLightModule = stripLastSep(pathToModule)

  if (program.available || program.autogenerate) {
    var page = program.available || program.autogenerate
    // if no area was specified defaults to main
    if (page.indexOf('@') === -1) {
      log.info("No target area specified, will default to 'main'")
      page = page.concat('@main')
    }
    args.targetPage = helper.parseDefinitionReference(page, moduleName)
    args.targetArea = args.targetPage.area

    args.templateDefinitionFilePath = path.normalize(args.pathToLightModule + '/templates/' + args.targetPage.path + '.yaml')
    if (!fs.existsSync(args.templateDefinitionFilePath)) {
      throw new MgnlCliError(util.format("%s page definition doesn't exist", args.templateDefinitionFilePath))
    }
    args.available = program.available
    args.autogenerate = program.autogenerate
  }

  args.moduleName = moduleName

  return args
}

exports.create = createComponent
exports.validateAndResolveArgs = validateAndResolveArgs
