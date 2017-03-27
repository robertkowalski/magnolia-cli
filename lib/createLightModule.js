var path = require('path')
var fs = require('fs')
var util = require('util')
var Promise = require('bluebird')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())
var createFromPrototype = require('./createFromPrototype.js')
var log = helper.logger

const MgnlCliError = helper.MgnlCliError
const i18next = require('./bootstrap.js')()

function validateAndResolveArgs (program) {
  const res = resolvePath(program)

  var lightModulesRoot
  if (program.path) {
    lightModulesRoot = path.resolve(program.path)
    if (!fs.existsSync(lightModulesRoot)) {
      throw new MgnlCliError(
        i18next.t(
          'mgnl-create-light-module--error-invalid-path',
          { path: lightModulesRoot, interpolation: { escapeValue: false } }
        )
      )
    }
  } else {
    log.info(i18next.t('mgnl-create-light-module--info-no-path'))
  }

  return res
}

exports.resolvePath = resolvePath
function resolvePath (program) {
  const withoutNameInstallation = !program.args[0]

  const p = program.path ? path.resolve(program.path) : path.resolve(process.cwd())
  const moduleName = withoutNameInstallation ? path.basename(p) : program.args[0]
  const modulesRoot = withoutNameInstallation ? path.dirname(p) : p

  return {
    withoutNameInstallation: withoutNameInstallation,
    lightModulesRoot: modulesRoot,
    moduleName: moduleName
  }
}

exports.createI18nProperties = createI18nProperties
function createI18nProperties (lightModulesRoot, moduleName, configJson) {
  return new Promise((resolve, reject) => {
    if (!configJson.lightDevFoldersInModule.i18n) {
      return resolve()
    }

    var file = path.join(lightModulesRoot, moduleName, configJson.lightDevFoldersInModule.i18n, util.format('%s-messages_en.properties', moduleName))
    const TXT = i18next.t('mgnl-create-light-module--i18n-fileheader')
    var writeFile = Promise.promisify(fs.writeFile)

    return writeFile(file, TXT, 'utf-8').then(resolve).catch(reject)
  })
}

function createLightModule (args, cb) {
  var fullPath = path.join(args.lightModulesRoot, args.moduleName)

  helper.createFolders(args.lightModulesRoot, args.moduleName)

  createI18nProperties(args.lightModulesRoot, args.moduleName, configJson).then(() => {
    // create readme
    var readme = path.join(fullPath, 'README.md')
    createFromPrototype.create('/README.md.tpl', readme, {
      '__lightDevModuleFolder__': args.moduleName
    }, done)

    function done (err) {
      if (err) return cb(err)
      log.info(
        i18next.t(
          'mgnl-create-light-module--info-module-created',
          { name: args.moduleName, path: fullPath, interpolation: { escapeValue: false } }
        )
      )

      const cmd = 'mgnl create-page $YOUR_PAGE_NAME -p ' + fullPath
      log.info(
        i18next.t(
          'mgnl-create-light-module--info-success',
          { cmd: cmd, interpolation: { escapeValue: false } }
        )
      )

      cb(null)
    }
  })
}

exports.create = createLightModule
exports.validateAndResolveArgs = validateAndResolveArgs
