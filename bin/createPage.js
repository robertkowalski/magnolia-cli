var path = require('path')
var fs = require('fs')
var util = require('util')

var createFromPrototype = require('./createFromPrototype')
var helper = require('./helper.js')
var MgnlCliError = helper.MgnlCliError
var configJson = require(helper.resolveMgnlCliJsonPath())

var createPage = function (params) {
  var templatePath = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.templates_pages, params.newPageName)
  var templateDefinitionFile = templatePath + '.yaml'
  var templateScriptFile = templatePath + '.ftl'

  var dialogDefinitionFile = path.join(params.pathToLightModule, configJson.lightDevFoldersInModule.dialogs_pages, params.newPageName + '.yaml')
  var dialogDefinitionId = params.moduleName + ':' + configJson.lightDevFoldersInModule.dialogs_pages.replace('/dialogs/', '') + '/' + params.newPageName

  // page definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(util.format("'%s' page template already exists at %s", params.newPageName, templateDefinitionFile))
  } else {
    createFromPrototype.create('/page/definition.yaml', templateDefinitionFile, {
      '__name__': params.newPageName,
      '__templateScript__': templateScriptFile.replace(params.pathToLightModule, path.sep + params.moduleName),
      '__dialog__': dialogDefinitionId
    })
  }

  // template script
  if (!fs.existsSync(templateScriptFile)) {
    createFromPrototype.create('/page/template.ftl', templateScriptFile, {
      '__name__': params.newPageName,
      '__lightDevModuleFolder__': '/' + params.moduleName
    })
  } else {
    helper.printInfo(util.format("'%s' templateScript already exists", templateScriptFile))
  }

  // dialog
  if (!fs.existsSync(dialogDefinitionFile)) {
    createFromPrototype.create('/page/dialog.yaml', dialogDefinitionFile, {
      '__name__': params.newPageName
    })
  } else {
    helper.printInfo(util.format("'%s' dialog already exists", dialogDefinitionFile))
  }
  helper.printSuccess('Page template created')
}

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  var moduleName
  var newPageName = program.args[0]
  if (newPageName.indexOf(path.sep) !== -1) {
    throw new MgnlCliError(util.format('%s is not valid page name. It should contain no slash character', newPageName), true)
  }

  if (program.path) {
    // clever trick with filter to get rid of unwanted separators found on http://stackoverflow.com/a/19888749 of course
    var splitPath = program.path.split(path.sep).filter(Boolean)
    newPageName = program.args[0]

    if (splitPath.length === 1) {
      moduleName = splitPath[0]
    } else {
      // assume last part is module name
      moduleName = splitPath[splitPath.length - 1]
    }
  } else {
    // assume the current dir is a light module.
    helper.printInfo(util.format('No path option provided, page template will be created in the current folder.'))
    moduleName = path.basename(process.cwd())
  }
  var pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)

  return {
    'pathToLightModule': pathToModule.endsWith(path.sep) ? pathToModule.slice(0, -1) : pathToModule,
    'moduleName': moduleName,
    'newPageName': newPageName
  }
}

exports.create = createPage
exports.validateAndResolveArgs = validateAndResolveArgs
