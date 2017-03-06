#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed')
const packageJson = require('../package.json')
const log = require('../lib/helper').logger

const tabCompletion = require('../lib/tabCompletion')
const i18next = require('../lib/bootstrap.js')()

program
  .version(packageJson.version)
  .name('mgnl tab-completion')
  .usage('<command>')
  .description(i18next.t('mgnl-tab-completion--cmd-option-description'))

program.command('install')
  .description(i18next.t('mgnl-tab-completion--cmd-install-option-description'))
  .action(() => checkSuccess(tabCompletion.install(), false))
program.command('uninstall')
  .description(i18next.t('mgnl-tab-completion--cmd-uninstall-option-description'))
  .action(() => checkSuccess(tabCompletion.uninstall(), true))

program.parse(process.argv)

function checkSuccess (success, uninstall) {
  if (success) {
    log.important(
      i18next.t(
        'mgnl-tab-completion--cmd-important-success',
        { installUninstalled: uninstall ? 'uninstalled' : 'installed' }
      )
    )
    return
  }
  log.error(
    i18next.t(
      'mgnl-tab-completion--cmd-error-installation-error',
      { installUninstalled: uninstall ? 'uninstalled' : 'installed' }
    )
  )
}

const action = program.args[0]
if (!(action instanceof program.Command)) {
  if (action) {
    log.error(
      i18next.t(
        'mgnl-tab-completion--cmd-error-invalid-action',
        { action: action, interpolation: { escapeValue: false } }
      )
    )
  }
  program.help()
}
