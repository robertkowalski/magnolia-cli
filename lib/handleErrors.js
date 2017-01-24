var program = require('commander')
var pkg = require('../package.json')
var log = require('npmlog')
var os = require('os')

function handleError (err) {
  if (!err) {
    process.exit(1)
  }

  log.error(err)

  if (err.displayHelp) {
    program.outputHelp()
  }

  if (err.stack) {
    log.error('', err.stack)
    log.error('', '')
    log.error('', '')
    log.error('', 'mgnl:', pkg.version, 'node:', process.version, 'os:', os.platform())
    log.error('', 'please open an issue including this log on ' + pkg.bugs.url)
  }

  process.exit(1)
}

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

module.export = handleError
