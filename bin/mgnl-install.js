#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed.js')

const installLightModule = require('../lib/install.js')
const packageJson = require('../package.json')

const path = require('path')

const helper = require('../lib/helper')
const getLightModulesFolderFromTomcatLocation = helper.getLightModulesFolderFromTomcatLocation
const MgnlCliError = helper.MgnlCliError

const i18next = require('../lib/bootstrap.js')()

program
  .version(packageJson.version)
  .name('mgnl install')
  .usage('<light-module-name> [<light-module-name> ...] [--path]')
  .description(i18next.t('mgnl-install--cmd-description'))
  .option('-p, --path <path>', i18next.t('mgnl-install--cmd-option-path'))
  .parse(process.argv)

function getPath (p) {
  let lightModulesFolder

  if (p) {
    return path.resolve(program.path)
  }

  lightModulesFolder = getLightModulesFolderFromTomcatLocation(process.cwd())
  if (!lightModulesFolder) {
    throw new MgnlCliError(
      i18next.t('mgnl-install--error-no-folder-found')
    )
  }

  return lightModulesFolder
}

const opts = {
  lightModulesFolder: getPath(program.path)
}

if (!program.args.length) {
  throw new MgnlCliError(
    i18next.t('mgnl-install--error-no-argument-given'),
    true
  )
}

installLightModule(program.args, opts)
  .then(process.exit.bind(this, 0))
