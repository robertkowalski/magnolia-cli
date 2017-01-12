var fs = require('fs-extra')
var path = require('path')
var async = require('async')
var downloadMagnolia = require('./downloadMagnolia.js')
var downloadJars = require('./downloadJars.js')
var extractMagnolia = require('./extractMagnolia.js')
var createLightModule = require('./createLightModule.js')
var editMagnoliaProperties = require('./editMagnoliaProperties.js')
var helper = require('./helper.js')
var configJson = require(helper.resolveMgnlCliJsonPath())
var util = require('util')

var checkMagnoliaVersion = function (version) {
  var tokens = version.split('.')
  var major = parseInt(tokens[0])
  var minor = parseInt(tokens[1])
  if (major < 5 || (major === 5 && minor < 4)) {
    throw util.format('Invalid Magnolia version %s, light development is available only for Magnolia 5.4 and greater', version)
  }
}

var prepareMagnolia = function (args, magnoliaZip) {
  extractMagnolia.extract(process.cwd(), magnoliaZip)

  if (args.moduleName) {
    createLightModule.create(args)
  }

  editMagnoliaProperties.editProperties()
  downloadJars.download(function () {
    var successMessage = 'Magnolia has been successfully setup for light development!\n' +
      "You can now go to 'apache-tomcat/bin' and start up Magnolia by entering './magnolia_control.sh start' " +
      'Magnolia will be ready after a few seconds at localhost:8080/magnoliaAuthor. Username and password is superuser\n' +
      "To stop Magnolia enter './magnolia_control.sh stop'. On Windows use magnolia_control.bat\n"

    helper.printSuccess(successMessage)
  })
}

var validateAndResolveArgs = function (program, credentials) {
  if (program.enterpriseEdition) {
    if (typeof credentials === 'undefined') {
      throw new Error('You need to provide your username/password to Magnolia Nexus, in order to download an Enterprise edition')
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
    helper.printInfo(util.format("No path option provided. Will use the default '%s' in the current directory", program.path))
  }

  if (program.magnoliaVersion) {
    checkMagnoliaVersion(program.magnoliaVersion)
    configJson.setupMagnolia.downloadUrl = configJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, program.magnoliaVersion)
  } else {
    // get the latest release.
    configJson.setupMagnolia.downloadUrl = configJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, 'LATEST')
    helper.printInfo('No magnolia-version option provided. Will use the latest stable version.')
  }
  /*
   * This absolute path will end up in magnolia.properties as the value of magnolia.resources.dir
   * If we're on Windows we need to replace the backslash, else it will cause Magnolia start up to fail.
   * See also top comment in magnolia.properties
   */
  var lightModulesRoot = process.platform === 'win32' ? path.resolve(program.path).replace(/\\/g, '/') : path.resolve(program.path)

  if (!fs.existsSync(lightModulesRoot)) {
    helper.printInfo(util.format("'%s' does not seem to exist. Path will be created automatically.", lightModulesRoot))
    fs.mkdirpSync(lightModulesRoot)
  }
  configJson.setupMagnolia.webapps.magnoliaAuthor['magnolia.resources.dir'] = lightModulesRoot

  var moduleName = null
  if (program.installSampleModule) {
    moduleName = program.installSampleModule
  }

  return {
    'lightModulesRoot': lightModulesRoot,
    'moduleName': moduleName
  }
}

var setupMagnolia = function (program, credentials) {
  var args = validateAndResolveArgs(program, credentials)

  var magnoliaZip = 'magnolia.zip'
  // we're downloading CE bundle, no authentication required
  if (typeof credentials === 'undefined') {
    credentials = {username: '', password: ''}
  }
  // start downloading Magnolia, it'll take a while and since Node.js is async
  downloadMagnolia.download(process.cwd(), magnoliaZip, credentials)
  // we need to wait until the zip file is actually there before proceeding
  async.until(
    // test function which will be repeated until true
    function () {
      return fs.existsSync(magnoliaZip)
    },
    // Once the condition is true, that is Magnolia has been fully downloaded,
    // the callback function can be invoked
    function (callback) {
      setTimeout(function () {
        callback(null)
      }, 100)
    },
    // callback function handling all operations subsequent to Magnolia download
    function (err) {
      if (err) {
        throw err
      }
      try {
        prepareMagnolia(args, magnoliaZip)
      } catch (e) {
        throw e
      }
    }
  )
}

exports.setupMagnolia = setupMagnolia
exports.validateAndResolveArgs = validateAndResolveArgs