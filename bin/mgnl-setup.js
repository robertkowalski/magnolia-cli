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
  var prototypesFolder = path.resolve(__dirname, '../_prototypes')
  console.log("Extracting Magnolia's CLI _prototypes and package.json to %s...", location)
  var pathToExtractedPrototypes = path.join(location, '_prototypes')

  fse.copy(prototypesFolder, pathToExtractedPrototypes, function (err) {
    if (err) {
      helper.printError(err)
      process.exit(1)
    }
  })
  var packageJsonPath = path.resolve(__dirname, '../package.json')
  fse.copy(packageJsonPath, path.join(location, 'package.json'), function (err) {
    if (err) {
      helper.printError(err)
      process.exit(1)
    }
  })
}

program
  .version(packageJson.version)
  .description('Extracts Magnolia CLI package.json and prototypes so that they can be customized. Custom prototypes will be used by CLI commands if a MGNLCLI_HOME env variable is set pointing at the folder where extraction occurred')
  .option('-p, --path <path>', 'The path to the destination folder. If no path is provided extraction will happen in the current directory')
  .parse(process.argv)

if (program.path) {
  extract(program.path)
} else {
  extract(process.cwd())
}
