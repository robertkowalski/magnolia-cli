const commandExistsSync = require('command-exists').sync

const tabCompletionBash = require('./tabCompletionBash')
const tabCompletionPowerShell = require('./tabCompletionPowerShell')

function install () {
  return !!(tabCompletionBash.install() | ifPowerShellExists(() => tabCompletionPowerShell.install()))
}

function uninstall () {
  return !!(tabCompletionBash.uninstall() | ifPowerShellExists(() => tabCompletionPowerShell.uninstall()))
}

function ifPowerShellExists (task) {
  if (commandExistsSync('powershell')) {
    return task()
  }
}

module.exports.install = install
module.exports.uninstall = uninstall
