var fs = require('fs-extra')
var path = require('path')
var downloadMagnolia = require('./downloadMagnolia.js')
var downloadJars = require('./downloadJars.js')
var extractMagnolia = require('./extractMagnolia.js')
var createLightModule = require('./createLightModule.js')
const editProperties = require('./editMagnoliaProperties.js').editProperties
var helper = require('./helper.js')
var configJson = require(helper.resolveMgnlCliJsonPath())
var log = helper.logger
const MgnlCliError = helper.MgnlCliError
const i18next = require('./bootstrap.js')()

var checkMagnoliaVersion = function (version) {
  var tokens = version.split('.')
  var major = parseInt(tokens[0])
  var minor = parseInt(tokens[1])
  if (major < 5 || (major === 5 && minor < 4)) {
    const errMsg = i18next.t(
      'mgnl-jumpstart--error-invalid-magnolia-version',
      { version: version, interpolation: { escapeValue: false } }
    )
    throw new MgnlCliError(errMsg)
  }
}

function prepareMagnolia (args, magnoliaZip, cb) {
  extractMagnolia.extract(process.cwd(), magnoliaZip)

  if (args.moduleName) {
    return createLightModule.create(args, proceed)
  }

  proceed()

  function proceed () {
    editProperties(configJson).then(() => {
      done()
    })
  }

  function done () {
    downloadJars.download(() => {
      log.important(i18next.t('mgnl-jumpstart--important-successful-set-up'))
      log.important(i18next.t('mgnl-jumpstart--important-success-open-terminal'))
      log.important(i18next.t('mgnl-jumpstart--important-success-magnolia-will-be-avail-at'))

      cb(null)
    })
  }
}

var validateAndResolveArgs = function (program, credentials) {
  if (program.enterpriseEdition) {
    if (typeof credentials === 'undefined') {
      throw new MgnlCliError(i18next.t('mgnl-jumpstart--error-invalid-credentials'))
    }
    var url = 'https://nexus.magnolia-cms.com/service/local/artifact/maven/content?r=magnolia.enterprise.releases&g=info.magnolia.eebundle'
    switch (credentials.type) {
      case 'EE Pro':
        url += '&a=magnolia-enterprise-pro-demo-bundle&c=tomcat-bundle&e=zip&v=${magnoliaVersion}'
        break
      // case 'NOW' TODO
      default:
    }
    configJson.setupMagnolia.downloadUrl = url
  }

  if (typeof program.path === 'undefined') {
    program.path = helper.defaultLightModulesRootName
    log.info(
      i18next.t(
        'mgnl-jumpstart--info-no-path-provided',
        { path: program.path, interpolation: { escapeValue: false } }
      )
    )
  }

  if (program.magnoliaVersion) {
    checkMagnoliaVersion(program.magnoliaVersion)
    configJson.setupMagnolia.downloadUrl = configJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, program.magnoliaVersion)
  } else {
    // get the latest release.
    configJson.setupMagnolia.downloadUrl = configJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, 'LATEST')
    log.info(i18next.t('mgnl-jumpstart--info-no-magnolia-option-provided'))
  }
  /*
   * This absolute path will end up in magnolia.properties as the value of magnolia.resources.dir
   * If we're on Windows we need to replace the backslash, else it will cause Magnolia start up to fail.
   * See also top comment in magnolia.properties
   */
  var lightModulesRoot = process.platform === 'win32' ? path.resolve(program.path).replace(/\\/g, '/') : path.resolve(program.path)

  if (!fs.existsSync(lightModulesRoot)) {
    log.info(
      i18next.t(
        'mgnl-jumpstart--info-light-modules-root-not-exist',
        { path: lightModulesRoot, interpolation: { escapeValue: false } }
      )
    )
    fs.mkdirpSync(lightModulesRoot)
  }
  // even if not created yet, at this stage we know tomcat will be in the current working directory with a certain name
  const magnoliaHome = path.join(process.cwd(), configJson.setupMagnolia.tomcatFolder, 'webapps', 'magnoliaAuthor')
  // Magnolia directory watcher doesn't like relative paths so we prepend it with ${magnolia.home}
  // a special placeholder which will be resolved to Magnolia's app home directory
  configJson.setupMagnolia.webapps.magnoliaAuthor['magnolia.resources.dir'] = '${magnolia.home}/' + path.relative(magnoliaHome, lightModulesRoot)

  var moduleName = null
  if (program.installSampleModule) {
    moduleName = program.installSampleModule
  }

  return {
    'lightModulesRoot': lightModulesRoot,
    'moduleName': moduleName
  }
}

function setupMagnolia (program, credentials, cb) {
  var args = validateAndResolveArgs(program, credentials)

  var magnoliaZip = 'magnolia.zip'
  // we're downloading CE bundle, no authentication required
  if (typeof credentials === 'undefined') {
    credentials = {username: '', password: ''}
  }

  // start downloading Magnolia
  downloadMagnolia.download(process.cwd(), magnoliaZip, credentials)
    .then(() => {
      // XXX promisify
      prepareMagnolia(args, magnoliaZip, cb)
    })
}

exports.setupMagnolia = setupMagnolia
exports.validateAndResolveArgs = validateAndResolveArgs
