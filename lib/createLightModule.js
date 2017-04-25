const path = require('path')
const fs = require('fs')
const util = require('util')
const Promise = require('bluebird')

const helper = require('./helper')
const configJson = require(helper.resolveMgnlCliJsonPath())
const createFromPrototype = require('./createFromPrototype.js')
const log = helper.logger

const MgnlCliError = helper.MgnlCliError
const i18next = require('./bootstrap.js')()

const getLightModulesFolderFromTomcatLocation = helper.getLightModulesFolderFromTomcatLocation
const findTomcat = helper.findTomcat

function validateAndResolveArgs (program) {
  const res = resolvePath(program)

  if (program.path) {
    const lightModulesRoot = path.resolve(program.path)
    if (!fs.existsSync(lightModulesRoot)) {
      throw new MgnlCliError(
        i18next.t(
          'mgnl-create-light-module--error-invalid-path',
          { path: lightModulesRoot, interpolation: { escapeValue: false } }
        )
      )
    }
    return res
  }
  log.info(i18next.t('mgnl-create-light-module--info-no-path'))
  const tomcatFolder = findTomcat()
  const lightModulesFolder = getLightModulesFolderFromTomcatLocation(tomcatFolder)

  if (res.lightModulesRoot !== lightModulesFolder && !program.force) {
    throw new MgnlCliError(
     i18next.t(
       'mgnl-create-light-module--error-no-lm-folder-detected',
       { path: res.lightModulesRoot, root: lightModulesFolder, tomcat: tomcatFolder, interpolation: { escapeValue: false } }
     ), true)
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

    const file = path.join(lightModulesRoot, moduleName, configJson.lightDevFoldersInModule.i18n, util.format('%s-messages_en.properties', moduleName))
    const TXT = i18next.t('mgnl-create-light-module--i18n-fileheader')
    const writeFile = Promise.promisify(fs.writeFile)

    return writeFile(file, TXT, 'utf-8').then(resolve).catch(reject)
  })
}

function createLightModule (args, cb) {
  const fullPath = path.join(args.lightModulesRoot, args.moduleName)

  helper.createFolders(args.lightModulesRoot, args.moduleName)

  createI18nProperties(args.lightModulesRoot, args.moduleName, configJson).then(() => {
    // create readme
    const readme = path.join(fullPath, 'README.md')
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
