#!/usr/bin/env node

require('../lib/handleErrors.js')

const program = require('../lib/commander_shimmed')
const packageJson = require('../package.json')
const log = require('../lib/helper').logger

const tabCompletion = require('../lib/tabCompletion')

program
  .version(packageJson.version)
  .name('mgnl tab-completion')
  .usage('<command>')
  .description('Enable or disable shell tab autocompletion for mgnl subcommands.' +
    ' This will install relevant shell initialization scripts, or remove them.')

program.command('install')
  .description('enable tab autocompletion')
  .action(() => checkSuccess(tabCompletion.install(), false))
program.command('uninstall')
  .description('disable tab autocompletion')
  .action(() => checkSuccess(tabCompletion.uninstall(), true))

program.parse(process.argv)

function checkSuccess (success, uninstall) {
  if (success) {
    log.important(`Tab autocompletion has been ${uninstall ? 'un' : ''}installed. You may need to re-open your shell for changes to take effect.`)
  } else {
    log.error(`Tab autocompletion could not be ${uninstall ? 'un' : ''}installed, since none of typical related directories or files were found and accesible.`)
  }
}

const action = program.args[0]
if (!(action instanceof program.Command)) {
  if (action) {
    log.error(`Invalid action "${action}"`)
  }
  program.help()
}
