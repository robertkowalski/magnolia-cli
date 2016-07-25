var packageJson = require('../package.json')
var fse = require('fs-extra')
var path = require('path')
var helper = require('./helper.js')
var program = require('commander')

var extract = function (location) {
  if (!fse.existsSync(location)) {
    helper.printError(location + ' path does not exist. Please fix it or create it.')
    process.exit(1)
  }
  console.log("Extracting Magnolia's CLI mgnl-cli-prototypes and package.json to %s...", location)
  var prototypesFolder = path.resolve(__dirname, '../mgnl-cli-prototypes')
  var pathToExtractedPrototypes = path.join(location, 'mgnl-cli-prototypes')
  var packageJsonPath = path.resolve(__dirname, '../package.json')
  var pathToExtractedJson = path.join(location, 'package.json')

  // don't overwrite existing files
  var options = {clobber: false}

  fse.copy(prototypesFolder, pathToExtractedPrototypes, options, function (err) {
    if (err) {
      helper.printError(err)
      process.exit(1)
    }
  })

  fse.copy(packageJsonPath, pathToExtractedJson, options, function (err) {
    if (err) {
      helper.printError(err)
      process.exit(1)
    }
    var absPathLocation = path.resolve(location)
    helper.printSuccess('Extraction completed.')
    helper.printImportant('To start using custom prototypes and package.json you need to set an environment variable MGNLCLI_HOME pointing at ' + absPathLocation + ' in your .profile OR run this command:\nexport MGNLCLI_HOME="' + absPathLocation + '"')
  })
}

program
  .version(packageJson.version)
  .description('Extracts Magnolia CLI package.json and prototypes so that they can be customized. Custom prototypes will be used by CLI commands if a MGNLCLI_HOME env variable is set pointing at the folder where extraction occurred')
  .option('-p, --path <path>', "The path to the destination folder. If no path is provided extraction will happen in the current directory. Existing files won't be overwritten.")
  .parse(process.argv)

if (program.path) {
  extract(program.path)
} else {
  extract(process.cwd())
}
