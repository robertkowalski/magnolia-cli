const program = require('../lib/commander_shimmed.js')
const log = require('npmlog')
const i18next = require('./bootstrap.js')()
const pkg = require('../package.json')
const helper = require('./helper')

function handleError (err) {
  if (!err) {
    process.exit(1)
  }

  log.error('', err.message)

  if (err.displayHelp) {
    program.outputHelp()
  }

  if (err.stack) {
    const textBugtrackerAdvice = i18next.t(
      'handle-errors--bugtracker-advice',
      { bugtracker: pkg.bugs.url, interpolation: { escapeValue: false } }
    )

    log.error('', err.stack)
    log.error('', '')
    log.error('', '')
    log.error('', helper.getEnv())
    log.error('', textBugtrackerAdvice)
  }

  process.exit(1)
}

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

module.export = handleError
