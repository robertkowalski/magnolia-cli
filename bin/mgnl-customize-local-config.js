#!/usr/bin/env node

require('../lib/handleErrors.js')

var packageJson = require('../package.json')
var program = require('../lib/commander_shimmed.js')
var log = require('../lib/helper').logger
var fs = require('fs-extra')
var path = require('path')
const i18next = require('../lib/bootstrap.js')()

program
  .version(packageJson.version)
  .name('mgnl customize-local-config')
  .description(i18next.t('mgnl-customize-local-config--cmd-option-description'))
  .option('-p, --path <path>', i18next.t('mgnl-customize-local-config--cmd-option-path'))
  .parse(process.argv)

if (program.path) {
  extractCLIConfig(program.path)
} else {
  extractCLIConfig(process.cwd())
}

function extractCLIConfig (location) {
  if (!fs.existsSync(location)) {
    log.error(
      i18next.t(
        'mgnl-customize-local-config--cmd-error-path-not-exists',
        { location: location, interpolation: { escapeValue: false } }
      )
    )
    process.exit(1)
  }

  log.info(
    i18next.t(
      'mgnl-customize-local-config--cmd-info-extracting-to',
      { location: location, interpolation: { escapeValue: false } }
    )
  )

  var prototypesFolder = path.resolve(__dirname, '../lib/config/mgnl-cli-prototypes')
  var pathToExtractedPrototypes = path.join(location, 'mgnl-cli-prototypes')
  var configJsonPath = path.resolve(__dirname, '../lib/config/mgnl-cli.json')
  var pathToExtractedJson = path.join(location, 'mgnl-cli.json')

  // don't overwrite existing files
  var options = {clobber: false}
  fs.copy(prototypesFolder, pathToExtractedPrototypes, options, function (err) {
    if (err) {
      log.error(err)
      process.exit(1)
    }
  })

  fs.copy(configJsonPath, pathToExtractedJson, options, function (err) {
    if (err) {
      log.error(err)
      process.exit(1)
    }

    log.info(i18next.t('mgnl-customize-local-config--cmd-info-extraction-completed'))

    log.important(i18next.t('mgnl-customize-local-config--cmd-important-general-info-lookup'))
  })
}
