#!/usr/bin/env node

require('../lib/handleErrors.js')

const packageJson = require('../package.json')
const program = require('../lib/commander_shimmed.js')
const log = require('../lib/helper').logger
const fs = require('fs-extra')
const path = require('path')
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

  const prototypesFolder = path.resolve(__dirname, '../lib/config/mgnl-cli-prototypes')
  const pathToExtractedPrototypes = path.join(location, 'mgnl-cli-prototypes')
  const configJsonPath = path.resolve(__dirname, '../lib/config/mgnl-cli.json')
  const pathToExtractedJson = path.join(location, 'mgnl-cli.json')

  // don't overwrite existing files
  const options = {clobber: false}
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
