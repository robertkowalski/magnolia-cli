#!/usr/bin/env node

require('../lib/handleErrors.js')

var packageJson = require('../package.json')
var fse = require('fs-extra')
var path = require('path')
var program = require('../lib/commander_shimmed.js')
var log = require('../lib/helper').logger

var extract = function (location) {
  if (!fse.existsSync(location)) {
    log.error(location + ' path does not exist. Please fix it or create it.')
    process.exit(1)
  }
  log.info("Extracting Magnolia's CLI mgnl-cli-prototypes and mgnl-cli.json to %s...", location)
  var prototypesFolder = path.resolve(__dirname, '../lib/config/mgnl-cli-prototypes')
  var pathToExtractedPrototypes = path.join(location, 'mgnl-cli-prototypes')
  var configJsonPath = path.resolve(__dirname, '../lib/config/mgnl-cli.json')
  var pathToExtractedJson = path.join(location, 'mgnl-cli.json')

  // don't overwrite existing files
  var options = {clobber: false}
  fse.copy(prototypesFolder, pathToExtractedPrototypes, options, function (err) {
    if (err) {
      log.error(err)
      process.exit(1)
    }
  })

  fse.copy(configJsonPath, pathToExtractedJson, options, function (err) {
    if (err) {
      log.error(err)
      process.exit(1)
    }
    log.info('Extraction completed.')
    log.important('Magnolia CLI looks in the current working directory or parent directories for the nearest "mgnl-cli.json" file and "mgnl-cli-prototypes" folder. If none are found, it defaults to their global values.')
  })
}

program
  .version(packageJson.version)
  .name('mgnl version')
  .description('Extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to have a custom configuration. Magnolia CLI looks in the current working directory or parent directories for the nearest "mgnl-cli.json" file and "mgnl-cli-prototypes" folder. If none are found, it defaults to their global values.')
  .option('-p, --path <path>', 'The path to the destination folder. If no path is provided extraction will happen in the current directory. Existing files won"t be overwritten.')
  .parse(process.argv)

if (program.path) {
  extract(program.path)
} else {
  extract(process.cwd())
}
