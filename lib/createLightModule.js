var path = require('path')
var fs = require('fs')
var util = require('util')
var Promise = require('bluebird')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())
var createFromPrototype = require('./createFromPrototype.js')

var MgnlCliError = helper.MgnlCliError
// var copyResources = require('./copyResources.js')

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  var lightModulesRoot

  if (program.path) {
    lightModulesRoot = path.resolve(program.path)
    if (!fs.existsSync(lightModulesRoot)) {
      throw new MgnlCliError(util.format('Path %s does not exist. Please fix it or create it first', lightModulesRoot))
    }
  } else {
    helper.printInfo('No path option provided, light module will be created in the current folder.')
    lightModulesRoot = process.cwd()
  }
  var moduleName = program.args[0]

  if (fs.existsSync(path.join(lightModulesRoot, moduleName))) {
    throw new MgnlCliError(util.format("Module '%s' already exists at %s", moduleName, lightModulesRoot))
  }

  return {
    'lightModulesRoot': lightModulesRoot,
    'moduleName': moduleName
  }
}

exports.createI18nProperties = createI18nProperties
function createI18nProperties (lightModulesRoot, moduleName, configJson) {
  return new Promise(function (resolve, reject) {
    if (!configJson.lightDevFoldersInModule.i18n) {
      return resolve()
    }

    var file = path.join(lightModulesRoot, moduleName, configJson.lightDevFoldersInModule.i18n, util.format('%s-messages_en.properties', moduleName))
    var TXT = '# Please, see https://documentation.magnolia-cms.com/display/DOCS/Internationalization'
    var writeFile = Promise.promisify(fs.writeFile)

    return writeFile(file, TXT, 'utf-8').then(resolve).catch(reject)
  })
}

function createLightModule (args, cb) {
  var fullPath = path.join(args.lightModulesRoot, args.moduleName)

  helper.createFolders(args.lightModulesRoot, args.moduleName)

  createI18nProperties(args.lightModulesRoot, args.moduleName, configJson).then(function () {
    // create readme
    var readme = path.join(fullPath, 'README.md')
    createFromPrototype.create('/README.md.tpl', readme, {
      '__module_name__': args.moduleName
    }, done)

    function done (err) {
      if (err) return cb(err)

      helper.printSuccess(util.format('Module %s created at %s', args.moduleName, args.lightModulesRoot))

      var cmd = 'mgnl create-page $YOUR_PAGE_NAME -p ' + fullPath
      helper.printSuccess(
        util.format('Success! In order to add a page, run %s', cmd)
      )

      cb(null)
    }
  })
}

exports.create = createLightModule
exports.validateAndResolveArgs = validateAndResolveArgs
