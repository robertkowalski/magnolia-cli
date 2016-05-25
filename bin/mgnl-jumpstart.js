var fs = require('fs-extra')
var async = require('async')
var downloadMagnolia = require('./downloadMagnolia.js')
var downloadJars = require('./downloadJars.js')
var extractMagnolia = require('./extractMagnolia.js')
var copyResources = require('./copyResources.js')
var editMagnoliaProperties = require('./editMagnoliaProperties.js')
var helper = require('./helper.js')
var packageJson = helper.requirePackageJson()
var program = require('commander')
var util = require('util')

var prepareMagnolia = function (args) {
  extractMagnolia.extract(process.cwd(), magnoliaZip)
  helper.createFolders(args.lightModulesRoot, args.moduleName)
  copyResources.copyLightDevResources(args.lightModulesRoot, args.moduleName)

  editMagnoliaProperties.editProperties()
  downloadJars.download(function () {
    var successMessage = 'Magnolia has been successfully setup for light development!\n' +
      "You can now go to 'apache-tomcat/bin' and start up Magnolia by entering './magnolia_control.sh start' " +
      'Magnolia will be ready after a few seconds at localhost:8080/magnoliaAuthor. Username and password is superuser\n' +
      "To stop Magnolia enter './magnolia_control.sh stop'. On Windows use magnolia_control.bat\n"

    helper.printSuccess(successMessage)
  })
}

var validateAndResolveArgs = function (program) {
  // defaults to package.json value
  if (typeof program.path === 'undefined') {
    program.path = packageJson.config.outputPath
    helper.printInfo(util.format("No path option provided. Will use the default '%s' in the current directory", program.path))
  }

  if (program.path === '-i' || program.path === '--install-sample-module' ||
    program.path === '-m' || program.path === '--magnolia-version') {
    helper.printError('--path[-p] argument is invalid')
    program.outputHelp()
    process.exit(1)
  }

  if (typeof program.magnoliaVersion !== 'undefined') {
    packageJson.setupMagnolia.downloadUrl = packageJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, program.magnoliaVersion)
  } else {
    // hardcode the latest release. Would be nice to have nexus automagically expose a URL to the 'latest' artifacts released
    packageJson.setupMagnolia.downloadUrl = packageJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, '5.4.6')
    helper.printInfo(util.format('No magnolia-version option provided. Will use the default Community Edition 5.4.6'))
  }
  var lightModulesRoot = helper.resolvePathRelativeToCurrentDir(program.path, true)
  packageJson.setupMagnolia.webapps.magnoliaAuthor['magnolia.resources.dir'] = lightModulesRoot

  var moduleName = packageJson.lightModuleName
  if (program.installSampleModule) {
    moduleName = program.installSampleModule
  } else {
    helper.printInfo(util.format("No install-sample-module option provided. Will use the default '%s'", moduleName))
  }

  return {
    'lightModulesRoot': lightModulesRoot,
    'moduleName': moduleName
  }
}

program
  .version(packageJson.version)
  .description('Downloads and sets up an instance of Magnolia CE for light development in the current directory.')
  .option('-p, --path <path>', "The path to the light modules root folder which will be observed for changes. If no path is provided, defaults to 'light-modules' in the current folder. Light modules are created under this folder which is observed by Magnolia for changes. The path to such folder is the value of 'magnolia.resources.dir' property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.")
  .option('-m, --magnolia-version <version>', 'If not provided defaults to the magnolia-community-demo-bundle version provided in package.json')
  .option('-i, --install-sample-module <name>', 'If provided will create a sample module under the light modules root folder. If no name is provided defaults to sampleModule')
  .parse(process.argv)

var args = validateAndResolveArgs(program)

var magnoliaZip = 'magnolia.zip'
// start downloading Magnolia, it'll take a while and since Node.js is async
downloadMagnolia.download(process.cwd(), magnoliaZip)
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
      helper.printError(err.message)
      process.exit(1)
    }
    try {
      prepareMagnolia(args)
    } catch (e) {
      helper.printError(e)
      process.exit(1)
    }
  }
)
